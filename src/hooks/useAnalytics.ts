import { useState, useEffect } from 'react';
import { spotifyAPI } from '@/lib/spotify';
import { useAuthStore } from '@/stores/authStore';

export interface SongAnalytics {
  id: string;
  title: string;
  artist: string;
  totalStreams: number;
  playlistAdds: number;
  saves: number;
  shares: number;
  revenue: number;
  platforms: {
    spotify: { streams: number; revenue: number };
    appleMusic: { streams: number; revenue: number };
    youtube: { views: number; revenue: number };
    soundcloud: { plays: number; revenue: number };
  };
  demographics: {
    ageGroups: Record<string, number>;
    genderSplit: { male: number; female: number; other: number };
    topCountries: Array<{ country: string; percentage: number }>;
    topCities: Array<{ city: string; listeners: number }>;
  };
  timeData: Array<{
    date: string;
    streams: number;
    revenue: number;
  }>;
}

export interface PlatformAnalytics {
  platform: string;
  totalStreams: number;
  totalRevenue: number;
  followerCount: number;
  monthlyGrowth: number;
  topSongs: Array<{
    title: string;
    streams: number;
    revenue: number;
  }>;
}

export interface MonthlyEarnings {
  month: string;
  year: number;
  totalRevenue: number;
  platformBreakdown: Record<string, number>;
  topEarningTrack: {
    title: string;
    revenue: number;
  };
}

export interface GeographicData {
  country: string;
  countryCode: string;
  listeners: number;
  streams: number;
  revenue: number;
  topCities: Array<{
    city: string;
    listeners: number;
    streams: number;
  }>;
}

export const useAnalytics = (connectedPlatforms: string[], timeRange: string = '30d') => {
  const { isSpotifyConnected, user } = useAuthStore();
  const [songAnalytics, setSongAnalytics] = useState<SongAnalytics[]>([]);
  const [platformAnalytics, setPlatformAnalytics] = useState<PlatformAnalytics[]>([]);
  const [monthlyEarnings, setMonthlyEarnings] = useState<MonthlyEarnings[]>([]);
  const [geographicData, setGeographicData] = useState<GeographicData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Transform Spotify data to our analytics format
  const transformSpotifyData = (spotifyData: any[]): SongAnalytics[] => {
    return spotifyData.map((track: any) => ({
      id: track.id,
      title: track.name,
      artist: track.artists?.[0]?.name || 'Unknown Artist',
      totalStreams: track.popularity * 1000, // Approximate streams from popularity
      playlistAdds: Math.floor(Math.random() * 100), // Placeholder
      saves: Math.floor(Math.random() * 50), // Placeholder
      shares: Math.floor(Math.random() * 25), // Placeholder
      revenue: track.popularity * 0.1, // Approximate revenue
      platforms: {
        spotify: { 
          streams: track.popularity * 1000, 
          revenue: track.popularity * 0.1 
        },
        appleMusic: { streams: 0, revenue: 0 },
        youtube: { views: 0, revenue: 0 },
        soundcloud: { plays: 0, revenue: 0 }
      },
      demographics: {
        ageGroups: {},
        genderSplit: { male: 50, female: 45, other: 5 },
        topCountries: [],
        topCities: []
      },
      timeData: []
    }));
  };

  // Platform-specific data fetching functions
  const fetchSpotifyData = async () => {
    if (!isSpotifyConnected) return null;
    
    try {
      // Initialize Spotify API first
      const initialized = await spotifyAPI.initialize();
      if (!initialized) {
        console.log('Spotify not properly initialized');
        return null;
      }

      // Get stored analytics from database
      const { data: storedData } = await spotifyAPI.getStoredAnalytics('top_tracks', 'medium_term');
      
      if (storedData && storedData.length > 0) {
        // Use most recent stored data
        const latestData = storedData[0];
        return transformSpotifyData(latestData.data);
      } else {
        // Fetch fresh data if no stored data
        try {
          const topTracks = await spotifyAPI.getTopTracks('medium_term', 20);
          return transformSpotifyData(topTracks);
        } catch (error) {
          console.error('Error fetching fresh Spotify data:', error);
          // Try to sync data first
          await spotifyAPI.syncAllAnalytics();
          const { data: newStoredData } = await spotifyAPI.getStoredAnalytics('top_tracks', 'medium_term');
          if (newStoredData && newStoredData.length > 0) {
            return transformSpotifyData(newStoredData[0].data);
          }
          return null;
        }
      }
    } catch (error) {
      console.error('Error fetching Spotify data:', error);
      return null;
    }
  };

  const fetchAppleMusicData = async () => {
    // Apple Music for Artists API integration
    return {};
  };

  const fetchYouTubeData = async () => {
    // YouTube Analytics API integration
    return {};
  };

  const fetchTikTokData = async () => {
    // TikTok for Developers API integration
    return {};
  };

  const fetchSoundCloudData = async () => {
    // SoundCloud API integration
    return {};
  };

  const fetchInstagramData = async () => {
    // Instagram Basic Display API integration
    return {};
  };

  const fetchAllAnalytics = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {

      if (isSpotifyConnected) {
        const spotifyData = await fetchSpotifyData();
      
        if (spotifyData) {
          setSongAnalytics(spotifyData);
          
          // Create platform analytics
          setPlatformAnalytics([{
            platform: 'Spotify',
            totalStreams: spotifyData.reduce((sum, song) => sum + song.totalStreams, 0),
            totalRevenue: spotifyData.reduce((sum, song) => sum + song.revenue, 0),
            followerCount: Math.floor(Math.random() * 1000), // Placeholder
            monthlyGrowth: Math.floor(Math.random() * 20), // Placeholder
            topSongs: spotifyData.slice(0, 5).map(song => ({
              title: song.title,
              streams: song.totalStreams,
              revenue: song.revenue
            }))
          }]);
        } else {
          setSongAnalytics([]);
          setPlatformAnalytics([]);
        }
      } else {
        setSongAnalytics([]);
        setPlatformAnalytics([]);
      }

      setMonthlyEarnings([]);
      setGeographicData([]);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
      setSongAnalytics([]);
      setPlatformAnalytics([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAllAnalytics();
    }
  }, [isSpotifyConnected, timeRange, user]);

  const getTotalMetrics = () => {
    const totalStreams = songAnalytics.reduce((sum, song) => sum + song.totalStreams, 0);
    const totalRevenue = songAnalytics.reduce((sum, song) => sum + song.revenue, 0);
    const totalPlaylistAdds = songAnalytics.reduce((sum, song) => sum + song.playlistAdds, 0);
    const totalFollowers = platformAnalytics.reduce((sum, platform) => sum + platform.followerCount, 0);

    return {
      totalStreams,
      totalRevenue,
      totalPlaylistAdds,
      totalFollowers
    };
  };

  const getTopPerformingSongs = (limit: number = 10) => {
    return songAnalytics
      .sort((a, b) => b.totalStreams - a.totalStreams)
      .slice(0, limit);
  };

  const getRevenueByPlatform = () => {
    return platformAnalytics.map(platform => ({
      platform: platform.platform,
      revenue: platform.totalRevenue,
      percentage: (platform.totalRevenue / getTotalMetrics().totalRevenue) * 100
    }));
  };

  const getGrowthTrends = () => {
    return platformAnalytics.map(platform => ({
      platform: platform.platform,
      growth: platform.monthlyGrowth
    }));
  };

  return {
    songAnalytics,
    platformAnalytics,
    monthlyEarnings,
    geographicData,
    loading,
    error,
    getTotalMetrics,
    getTopPerformingSongs,
    getRevenueByPlatform,
    getGrowthTrends,
    refetch: fetchAllAnalytics
  };
};