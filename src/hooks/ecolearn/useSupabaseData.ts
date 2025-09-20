import { useState, useEffect } from 'react';
import { supabase } from '../../lib/ecolearn/supabase';
import type { Database } from '../../lib/ecolearn/supabase';

type Tables = Database['public']['Tables'];

export function useSupabaseBins() {
  const [bins, setBins] = useState<Tables['bins']['Row'][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBins();
  }, []);

  const fetchBins = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bins')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBins(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateBin = async (id: string, updates: Tables['bins']['Update']) => {
    try {
      const { error } = await supabase
        .from('bins')
        .update({ ...updates, last_updated: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      await fetchBins(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const createBin = async (bin: Tables['bins']['Insert']) => {
    try {
      const { error } = await supabase
        .from('bins')
        .insert([bin]);

      if (error) throw error;
      await fetchBins(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return { bins, loading, error, updateBin, createBin, refetch: fetchBins };
}

export function useSupabaseVehicles() {
  const [vehicles, setVehicles] = useState<Tables['vehicles']['Row'][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVehicles(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateVehicle = async (id: string, updates: Tables['vehicles']['Update']) => {
    try {
      const { error } = await supabase
        .from('vehicles')
        .update({ ...updates, last_updated: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      await fetchVehicles(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const createVehicle = async (vehicle: Tables['vehicles']['Insert']) => {
    try {
      const { error } = await supabase
        .from('vehicles')
        .insert([vehicle]);

      if (error) throw error;
      await fetchVehicles(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return { vehicles, loading, error, updateVehicle, createVehicle, refetch: fetchVehicles };
}

export function useSupabaseChampions() {
  const [champions, setChampions] = useState<Tables['green_champions']['Row'][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchChampions();
  }, []);

  const fetchChampions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('green_champions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChampions(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateChampion = async (id: string, updates: Tables['green_champions']['Update']) => {
    try {
      const { error } = await supabase
        .from('green_champions')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      await fetchChampions(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const createChampion = async (champion: Tables['green_champions']['Insert']) => {
    try {
      const { error } = await supabase
        .from('green_champions')
        .insert([champion]);

      if (error) throw error;
      await fetchChampions(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return { champions, loading, error, updateChampion, createChampion, refetch: fetchChampions };
}