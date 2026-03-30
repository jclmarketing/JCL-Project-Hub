-- ============================================================
-- Migration: Add project-hub columns to websites table
-- Run in Supabase SQL Editor for project lmggfpjslnuzfbknsdcq
-- ============================================================

-- 1. Add new columns
ALTER TABLE websites
  ADD COLUMN IF NOT EXISTS slug text UNIQUE,
  ADD COLUMN IF NOT EXISTS color text DEFAULT '#8B5CF6',
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS external_url text;

-- 2. Backfill slug from name for any existing rows
UPDATE websites
SET slug = lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL;

-- 3. Make slug required going forward
ALTER TABLE websites ALTER COLUMN slug SET NOT NULL;

-- 4. Seed project-hub projects into the websites table
-- Using ON CONFLICT to avoid duplicates if re-run
INSERT INTO websites (name, slug, description, site_builder, category, color, status, external_url) VALUES
  ('WDS Carpentry', 'wds-carpentry', 'Carpentry & general building - Herne Bay, Kent', 'static', 'Client Website', '#1a1b4b', 'active', NULL),
  ('Now 24 Hour Locksmiths', 'now-24-locksmiths', 'Emergency locksmith website - Glasgow & Clydebank', 'static', 'Client Website', '#f97316', 'active', NULL),
  ('Ingram Security', 'ingram-security', 'Locksmith & security specialists website - Glasgow', 'static', 'Client Website', '#1e3a5f', 'active', NULL),
  ('Arco Locksmiths', 'arco-locksmiths', 'Locksmith services website', 'static', 'Client Website', '#3B82F6', 'active', NULL),
  ('CP Electrics', 'cp-electrics', 'Electrical services website', 'static', 'Client Website', '#F59E0B', 'active', NULL),
  ('Current Tech Solutions', 'current-tech-solutions', 'Tech solutions company website', 'static', 'Client Website', '#10B981', 'active', NULL),
  ('Averis Electrical', 'averis-electrical', 'Electrical contractor website', 'static', 'Client Website', '#8B5CF6', 'active', NULL),
  ('Simon Paul Hair', 'simon-paul-hair', 'Hair salon website', 'static', 'Client Website', '#EC4899', 'active', NULL),
  ('Holmlea Locksmith', 'holmlea-locksmith', 'Locksmith services website', 'static', 'Client Website', '#6366F1', 'active', NULL),
  ('AP Sweepz', 'ap-sweepz-redesign', 'Chimney sweep services redesign', 'static', 'Redesign', '#F97316', 'active', NULL),
  ('Excel Asbestos', 'excel-asbestos-redesign', 'Asbestos removal services redesign', 'static', 'Redesign', '#EF4444', 'active', NULL),
  ('PatternIQ', 'patterniq-redesign', 'PatternIQ platform redesign', 'static', 'Redesign', '#14B8A6', 'active', NULL),
  ('Agency Portfolio', 'agency-portfolio', 'Digital agency portfolio site', 'static', 'Portfolio', '#A855F7', 'active', NULL),
  ('AI Agency Portfolio', 'ai-agency-portfolio', 'AI-focused agency portfolio', 'static', 'Portfolio', '#06B6D4', 'active', NULL),
  ('Agent Dashboard', 'agent-dashboard', 'AI agent monitoring dashboard', 'nextjs', 'App', '#2563EB', 'active', NULL),
  ('Primera Redesign', 'primera-redesign', 'Primera website redesign', 'nextjs', 'Redesign', '#DC2626', 'active', NULL),
  ('Mighty Theme', 'mighty-theme', 'Custom WordPress theme', 'wordpress', 'WordPress', '#21759B', 'active', NULL),
  ('Raw Honey Theme', 'rawhoney-theme', 'WordPress theme for Raw Honey', 'wordpress', 'WordPress', '#D97706', 'active', NULL),
  ('Brooks Theme Update', 'brooks-theme-update', 'WordPress theme updates', 'wordpress', 'WordPress', '#059669', 'active', NULL),
  ('Current Tech Solutions WP', 'current-tech-solutions-wp', 'WordPress version of CTS site', 'wordpress', 'WordPress', '#7C3AED', 'active', NULL),
  ('Averis Electrical WP', 'averis-electrical-wp', 'WordPress version of Averis site', 'wordpress', 'WordPress', '#BE185D', 'active', NULL),
  ('JCL CRM', 'jcl-crm', 'Digital Agency Management CRM', 'github', 'GitHub', '#8B5CF6', 'active', 'https://crm.jclmarketing.co.uk'),
  ('RR Access CRM', 'rraccess-crm', 'CRM for RR Access', 'github', 'GitHub', '#EF4444', 'active', 'https://crm.rraccess.co.uk'),
  ('Garage Roof Company CRM', 'garage-roof-crm', 'CRM for Garage Roof Company', 'github', 'GitHub', '#F59E0B', 'active', 'https://crm.garageroofcompany.co.uk'),
  ('Mighty CRM', 'mighty-crm', 'CRM for Mighty Structural', 'github', 'GitHub', '#10B981', 'active', 'https://crm.mightystructural.com'),
  ('JCL Project Hub', 'jcl-project-hub', 'This project hub dashboard', 'github', 'GitHub', '#171717', 'active', 'https://jcl-project-hub.vercel.app'),
  ('Holmlea Locksmith', 'holmlea-locksmith-gh', 'Modern 24/7 locksmith website for Holmlea Locksmith Services, Glasgow', 'github', 'GitHub', '#6366F1', 'active', 'https://holmlea-locksmith.vercel.app'),
  ('Arco Locksmiths', 'acro-locksmith-gh', '24/7 Emergency Locksmith serving Ayrshire, Glasgow & beyond', 'github', 'GitHub', '#3B82F6', 'active', 'https://acro-locksmith.vercel.app'),
  ('CP Electrical', 'cp-electrical-gh', 'Electrical services website deployed on Vercel', 'github', 'GitHub', '#F59E0B', 'active', 'https://cp-electrical.vercel.app')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  site_builder = EXCLUDED.site_builder,
  category = EXCLUDED.category,
  color = EXCLUDED.color,
  external_url = EXCLUDED.external_url;
