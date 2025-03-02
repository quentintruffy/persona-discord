drop policy "Enable read access for all users" on "public"."guilds";

revoke delete on table "public"."guilds" from "anon";

revoke insert on table "public"."guilds" from "anon";

revoke references on table "public"."guilds" from "anon";

revoke select on table "public"."guilds" from "anon";

revoke trigger on table "public"."guilds" from "anon";

revoke truncate on table "public"."guilds" from "anon";

revoke update on table "public"."guilds" from "anon";

revoke delete on table "public"."guilds" from "authenticated";

revoke insert on table "public"."guilds" from "authenticated";

revoke references on table "public"."guilds" from "authenticated";

revoke select on table "public"."guilds" from "authenticated";

revoke trigger on table "public"."guilds" from "authenticated";

revoke truncate on table "public"."guilds" from "authenticated";

revoke update on table "public"."guilds" from "authenticated";

revoke delete on table "public"."guilds" from "service_role";

revoke insert on table "public"."guilds" from "service_role";

revoke references on table "public"."guilds" from "service_role";

revoke select on table "public"."guilds" from "service_role";

revoke trigger on table "public"."guilds" from "service_role";

revoke truncate on table "public"."guilds" from "service_role";

revoke update on table "public"."guilds" from "service_role";

alter table "public"."guilds" drop constraint "guilds_pkey";

drop index if exists "public"."guilds_pkey";

drop table "public"."guilds";


