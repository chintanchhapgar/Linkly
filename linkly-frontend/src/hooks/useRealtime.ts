import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getSocket } from '../lib/socket';
import { useAuth } from '../store/auth';

interface ClickEvent {
  linkId: string;
  shortCode: string;
  totalClicks: number;
  country: string;
  city: string;
  device: string;
  browser: string;
  timestamp: string;
}

// Hook for dashboard - listens to ALL clicks for current user
export function useRealtimeDashboard() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;

    const socket = getSocket();
    
    // Join user's room
    socket.emit('join-user-room', user.id);

    // Listen for clicks on any of user's links
    const handleNewClick = (data: ClickEvent) => {
      console.log('🔥 New click received:', data);
      
      // Show toast notification
      toast.success(
        `🎯 New click on /${data.shortCode}`,
        {
          description: `From ${data.country} · ${data.device}`,
          duration: 3000,
        }
      );

      // Update dashboard data
      queryClient.invalidateQueries({ queryKey: ['links'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    };

    socket.on('new-click', handleNewClick);

    return () => {
      socket.off('new-click', handleNewClick);
    };
  }, [user?.id, queryClient]);
}

// Hook for analytics page - listens to specific link
export function useRealtimeLink(linkId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!linkId) return;

    const socket = getSocket();
    
    // Join link's room
    socket.emit('join-link-room', linkId);

    // Listen for clicks on this specific link
    const handleClick = (data: ClickEvent) => {
      console.log('📊 Link click received:', data);
      
      // Update analytics data
      queryClient.invalidateQueries({ queryKey: ['analytics', linkId] });
    };

    socket.on('link-click', handleClick);

    return () => {
      socket.off('link-click', handleClick);
    };
  }, [linkId, queryClient]);
}

// Hook for connection status
export function useSocketStatus() {
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    const socket = getSocket();
    
    setIsConnected(socket.connected);
    
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);
    
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  return isConnected;
}

// Import useState
import { useState } from 'react';