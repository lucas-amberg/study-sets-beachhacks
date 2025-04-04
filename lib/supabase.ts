import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export type StudySet = {
    id: number;
    created_at: string;
    name?: string;
};

export type StudyMaterial = {
    id: string;
    created_at: string;
    study_set: number;
};

export type CategoryScore = {
    id?: number;
    category_name: string;
    questions_right: number;
    questions_solved: number;
    created_at?: string;
};

export type StudySetScore = {
    id: number;
    questions_right: number;
    questions_solved: number;
    created_at?: string;
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
