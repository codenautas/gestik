alter table "tipos_ticket" alter column "descripcion" text;
alter table "tipos_ticket" add constraint "descripcion<>''" check ("descripcion"<>'');