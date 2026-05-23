import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"

export async function POST() {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    }
  )

  const queries = [
    // Profiles table
    `CREATE TABLE IF NOT EXISTS public.profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      profile_type TEXT NOT NULL DEFAULT 'general',
      full_name TEXT,
      age INTEGER,
      state TEXT,
      category TEXT,
      annual_income INTEGER,
      education_level TEXT,
      gender TEXT,
      onboarding_completed BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    
    // Schemes table
    `CREATE TABLE IF NOT EXISTS public.schemes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      description TEXT,
      ministry TEXT,
      eligibility_criteria JSONB DEFAULT '{}',
      benefits TEXT,
      application_url TEXT,
      documents_required TEXT[],
      category TEXT,
      target_audience TEXT[],
      min_age INTEGER,
      max_age INTEGER,
      min_income INTEGER,
      max_income INTEGER,
      applicable_states TEXT[],
      applicable_categories TEXT[],
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    
    // Saved schemes table
    `CREATE TABLE IF NOT EXISTS public.saved_schemes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      scheme_id UUID NOT NULL REFERENCES public.schemes(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, scheme_id)
    )`,
    
    // Checklist items table
    `CREATE TABLE IF NOT EXISTS public.checklist_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      scheme_id UUID NOT NULL REFERENCES public.schemes(id) ON DELETE CASCADE,
      document_name TEXT NOT NULL,
      is_completed BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, scheme_id, document_name)
    )`,

    // Enable RLS on all tables
    `ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE public.schemes ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE public.saved_schemes ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY`,

    // RLS policies for profiles
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_select_own') THEN
        CREATE POLICY profiles_select_own ON public.profiles FOR SELECT USING (auth.uid() = id);
      END IF;
    END $$`,
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_insert_own') THEN
        CREATE POLICY profiles_insert_own ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
      END IF;
    END $$`,
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_update_own') THEN
        CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE USING (auth.uid() = id);
      END IF;
    END $$`,

    // RLS policies for schemes (public read)
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'schemes' AND policyname = 'schemes_select_all') THEN
        CREATE POLICY schemes_select_all ON public.schemes FOR SELECT USING (true);
      END IF;
    END $$`,

    // RLS policies for saved_schemes
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'saved_schemes' AND policyname = 'saved_schemes_select_own') THEN
        CREATE POLICY saved_schemes_select_own ON public.saved_schemes FOR SELECT USING (auth.uid() = user_id);
      END IF;
    END $$`,
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'saved_schemes' AND policyname = 'saved_schemes_insert_own') THEN
        CREATE POLICY saved_schemes_insert_own ON public.saved_schemes FOR INSERT WITH CHECK (auth.uid() = user_id);
      END IF;
    END $$`,
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'saved_schemes' AND policyname = 'saved_schemes_delete_own') THEN
        CREATE POLICY saved_schemes_delete_own ON public.saved_schemes FOR DELETE USING (auth.uid() = user_id);
      END IF;
    END $$`,

    // RLS policies for checklist_items
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'checklist_items' AND policyname = 'checklist_select_own') THEN
        CREATE POLICY checklist_select_own ON public.checklist_items FOR SELECT USING (auth.uid() = user_id);
      END IF;
    END $$`,
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'checklist_items' AND policyname = 'checklist_insert_own') THEN
        CREATE POLICY checklist_insert_own ON public.checklist_items FOR INSERT WITH CHECK (auth.uid() = user_id);
      END IF;
    END $$`,
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'checklist_items' AND policyname = 'checklist_update_own') THEN
        CREATE POLICY checklist_update_own ON public.checklist_items FOR UPDATE USING (auth.uid() = user_id);
      END IF;
    END $$`,
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'checklist_items' AND policyname = 'checklist_delete_own') THEN
        CREATE POLICY checklist_delete_own ON public.checklist_items FOR DELETE USING (auth.uid() = user_id);
      END IF;
    END $$`,

    // Trigger to auto-create profile on signup
    `CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $$
    BEGIN
      INSERT INTO public.profiles (id)
      VALUES (new.id)
      ON CONFLICT (id) DO NOTHING;
      RETURN new;
    END;
    $$`,
    
    `DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users`,
    
    `CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_new_user()`,
  ]

  const results = []
  for (const query of queries) {
    const { error } = await supabase.rpc("exec_sql", { sql: query }).single()
    if (error) {
      // Try direct query if rpc doesn't work
      const { error: directError } = await supabase.from("_setup").select("*").limit(0)
      results.push({ query: query.substring(0, 50), error: error.message })
    } else {
      results.push({ query: query.substring(0, 50), success: true })
    }
  }

  return NextResponse.json({ 
    message: "Database setup attempted. Please run these SQL commands in the Supabase dashboard SQL editor if automatic setup failed.",
    results,
    manualSQL: queries.join(";\n\n")
  })
}
