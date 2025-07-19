import { useEffect, useState } from 'react';
import { supabase } from './supabase';

export function useProjects() {
  const [projects, setProjects] = useState([]);
  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error) setProjects(data);
    };
    fetchProjects();
  }, []);
  return projects;
} 