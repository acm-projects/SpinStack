import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import StackViewer from '@/components/stackViewer';
import { supabase } from '@/constants/supabase';

const NGROK_URL = process.env.EXPO_PUBLIC_NGROK_URL;

export default function StackViewerPage() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [moments, setMoments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            fetchStackWithMoments();
        }
    }, [id]);

    const fetchStackWithMoments = async () => {
        try {
            setLoading(true);
            const token = (await supabase.auth.getSession()).data.session?.access_token;
            if (!token) throw new Error('Not authenticated');

            const res = await fetch(`${NGROK_URL}/api/stacks/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const responseText = await res.text();

            if (!res.ok) {
                throw new Error(`Failed to fetch stack: ${res.status} - ${responseText}`);
            }

            const stackData = JSON.parse(responseText);
            console.log('Stack data:', stackData);

            if (!stackData.moments || stackData.moments.length === 0) {
                setError('No moments found in this stack');
                setLoading(false);
                return;
            }

            // Fetch user data for the stack owner
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('username, pfp_url')
                .eq('id', stackData.user_id)
                .single();

            if (userError) {
                console.error('Error fetching user:', userError);
            }

            const userProfilePic = await fetchProfilePictureUrl(userData?.pfp_url);

            // Transform moments to match the format MomentView expects
            const transformedMoments = await Promise.all(
                stackData.moments.map(async (item: any) => {
                    const coverUrl = await fetchCoverImageUrl(item.cover_url);
                    const trackId = extractTrackId(item.song_url);

                    // IMPORTANT: MomentView expects { moment: {...}, user: {...}, type: "..." }
                    return {
                        moment: {
                            id: item.id,
                            spotifyId: trackId,
                            title: item.title || 'Untitled',
                            artist: item.description || 'Unknown Artist',
                            songStart: item.start_time || 0,
                            songDuration: item.duration || 30,
                            length: 180,
                            album: coverUrl ? { uri: coverUrl } : require('@/assets/images/album1.jpeg'),
                            waveform: Array(50).fill(0).map(() => Math.floor(Math.random() * 25)),
                        },
                        user: {
                            name: userData?.username || 'Unknown User',
                            profilePic: userProfilePic,
                        },
                        type: 'moment' as const,
                    };
                })
            );

            console.log('Transformed moments:', transformedMoments);
            setMoments(transformedMoments);
        } catch (err: any) {
            console.error('Error fetching stack:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchProfilePictureUrl = async (pfpPath: string | null): Promise<string | null> => {
        if (!pfpPath) return null;

        try {
            const res = await fetch(`${NGROK_URL}/api/upload/download-url/${pfpPath}`);
            if (res.ok) {
                const { downloadURL } = await res.json();
                return downloadURL;
            }
        } catch (err) {
            console.error('Failed to fetch profile picture URL:', err);
        }
        return null;
    };

    const fetchCoverImageUrl = async (coverPath: string | null): Promise<string | null> => {
        if (!coverPath) return null;
        if (coverPath.startsWith('http://') || coverPath.startsWith('https://')) {
            return coverPath;
        }

        try {
            const res = await fetch(`${NGROK_URL}/api/upload/download-url/${coverPath}`);
            if (res.ok) {
                const { downloadURL } = await res.json();
                return downloadURL;
            }
        } catch (err) {
            console.error('Failed to fetch cover image URL:', err);
        }
        return null;
    };

    const extractTrackId = (songUrl: string): string | null => {
        if (!songUrl) return null;
        const match = songUrl.match(/track\/([a-zA-Z0-9]+)/);
        return match ? match[1] : null;
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF0E2' }}>
                <ActivityIndicator size="large" color="#333C42" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF0E2' }}>
                <Text style={{ color: '#333C42', fontSize: 16, marginBottom: 10 }}>Error: {error}</Text>
                <Text
                    style={{ color: '#333C42', textDecorationLine: 'underline' }}
                    onPress={() => router.back()}
                >
                    Go Back
                </Text>
            </View>
        );
    }

    return <StackViewer moments={moments} />;
}
