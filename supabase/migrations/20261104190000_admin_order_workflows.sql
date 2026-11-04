-- Admin-only order transitions. The database remains authoritative for status
-- changes and restores stock exactly once when an order is cancelled.
create or replace function public.update_order_status(
  p_order_id uuid,
  p_to_status public.order_status,
  p_internal_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders;
  v_item public.order_items;
begin
  if not public.is_admin() then
    raise exception using errcode = '42501', message = 'Admin access required';
  end if;

  if p_internal_notes is not null and char_length(p_internal_notes) > 5000 then
    raise exception using errcode = '22023', message = 'Internal note is too long';
  end if;

  select * into v_order
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    raise exception using errcode = 'P0002', message = 'Order not found';
  end if;

  if v_order.status = p_to_status then
    update public.orders
    set internal_notes = case
      when p_internal_notes is null then internal_notes
      else trim(p_internal_notes)
    end
    where id = v_order.id;
    return jsonb_build_object('reference', v_order.public_reference, 'status', v_order.status);
  end if;

  if not (
    (v_order.status = 'new' and p_to_status in ('confirmed', 'cancelled'))
    or (v_order.status = 'confirmed' and p_to_status in ('preparing', 'cancelled'))
    or (v_order.status = 'preparing' and p_to_status in ('shipped', 'cancelled'))
    or (v_order.status = 'shipped' and p_to_status = 'delivered')
    or (v_order.status = 'delivered' and p_to_status = 'returned')
  ) then
    raise exception using errcode = '22023', message = 'Invalid order status transition';
  end if;

  if p_to_status = 'cancelled' then
    for v_item in
      select * from public.order_items where order_id = v_order.id
    loop
      update public.products
      set stock_quantity = stock_quantity + v_item.quantity
      where id = v_item.product_id;
    end loop;
  end if;

  update public.orders
  set status = p_to_status,
      internal_notes = case
        when p_internal_notes is null then internal_notes
        else trim(p_internal_notes)
      end
  where id = v_order.id;

  insert into public.order_status_history (order_id, from_status, to_status, changed_by, note)
  values (v_order.id, v_order.status, p_to_status, auth.uid(), nullif(trim(p_internal_notes), ''));

  return jsonb_build_object(
    'reference', v_order.public_reference,
    'status', p_to_status,
    'stock_restored', p_to_status = 'cancelled'
  );
end;
$$;

revoke all on function public.update_order_status(uuid, public.order_status, text) from public;
grant execute on function public.update_order_status(uuid, public.order_status, text) to authenticated;
