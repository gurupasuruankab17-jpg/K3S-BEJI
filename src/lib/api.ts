import { supabase } from './supabase';
import { Event, UserReport, ResourceItem } from '../types';

export async function getEvents() {
  const { data, error } = await supabase.from('events').select('*').order('date', { ascending: false });
  if (error) throw error;
  return data as Event[];
}

export async function getEventById(id: string) {
  const { data, error } = await supabase.from('events').select('*').eq('id', id).single();
  if (error) throw error;
  return data as Event;
}

export async function getResources() {
  const { data, error } = await supabase.from('resources').select('*');
  if (error) throw error;
  return data as ResourceItem[];
}

export async function getChartData() {
  const { data, error } = await supabase.from('chart_data').select('*');
  if (error) {
    console.warn('Chart data not found, using empty array', error);
    return [];
  }
  return data;
}

export async function getUserReports(userId?: string) {
  if (!userId) return [];
  const { data, error } = await supabase.from('user_reports').select('*').eq('user_id', userId);
  if (error) throw error;
  return data as UserReport[];
}

export async function getAllUserReports() {
  const { data, error } = await supabase.from('user_reports').select('*, users(name, email)');
  if (error) throw error;
  return data;
}

export async function updateUserReport(id: string, updates: Partial<UserReport>) {
  const { data, error } = await supabase.from('user_reports').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function createEvent(event: Partial<Event>) {
  const { data, error } = await supabase.from('events').insert(event).select().single();
  if (error) throw error;
  return data;
}

export async function updateEvent(id: string, updates: Partial<Event>) {
  const { data, error } = await supabase.from('events').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteEvent(id: string) {
  const { error } = await supabase.from('events').delete().eq('id', id);
  if (error) throw error;
}
