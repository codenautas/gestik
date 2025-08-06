alter table gestik.proyectos add column "abierto" boolean default 'true';
alter table gestik.proyectos alter column "abierto" set not null;
alter table gestik.proyectos add column "observaciones" text;
alter table gestik.proyectos add column "descripcion" text;
