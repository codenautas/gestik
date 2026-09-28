ALTER TABLE gestik.tickets ADD COLUMN f_inicio date;
ALTER TABLE gestik.anotaciones ALTER COLUMN usuario SET DEFAULT gestik.get_app_user();