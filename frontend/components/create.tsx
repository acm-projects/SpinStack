// app/TestSpotify.tsx
import React, { useEffect, useMemo, useRef, useState } from "react"
import { View, Text, Button, Alert, StyleSheet, Image } from "react-native"
import * as Spotify from "@wwdrew/expo-spotify-sdk"

const TRACK_URI = "spotify:track:3NM41PVVUr0ceootKAtkAj"
const API_BASE = "https://api.spotify.com/v1"

type Device = {
  id: string
  is_active: boolean
  name: string
  type: string
  is_restricted: boolean
}

type PlaybackState = {
  is_playing: boolean
  progress_ms: number // current position
  item?: {
    name: string // title
    duration_ms: number
    album: { images: { url: string }[] }
    artists: { name: string }[]
  } | null
}

export default function TestSpotify() {
  const [token, setToken] = useState<string | null>(null)
  const [playback, setPlayback] = useState<PlaybackState | null>(null)
  const pollingRef = useRef<NodeJS.Timer | null>(null)

  const title = playback?.item?.name ?? ""
  const artist = useMemo(
    () => playback?.item?.artists?.map((a) => a.name).join(", ") ?? "",
    [playback?.item?.artists]
  )
  const albumArt = playback?.item?.album?.images?.[0]?.url ?? ""
  const progressMs = playback?.progress_ms ?? 0
  const durationMs = playback?.item?.duration_ms ?? 0

  const SNIPPET_START_MS = 37000
  const SNIPPET_END_MS = 68000

  const authorize = async () => {
    try {
      const session = await Spotify.Authenticate.authenticateAsync({
        scopes: [
          "user-read-playback-state",
          "user-modify-playback-state",
          "app-remote-control",
        ],
      })
      setToken(session.accessToken)
      Alert.alert("Spotify", "Authorized!")
    } catch (e: any) {
      Alert.alert("Auth error", String(e?.message ?? e))
    }
  }

  const api = async (path: string, init?: RequestInit) => {
    if (!token) throw new Error("No token")
    const res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(init?.headers || {}),
      },
    })
    return res
  }

  const getDevices = async (): Promise<Device[]> => {
    const res = await api("/me/player/devices")
    if (!res.ok) throw new Error(`devices: ${res.status}`)
    const data = await res.json()
    return data.devices as Device[]
  }

  const transferPlayback = async (deviceId: string) => {
    await api("/me/player", {
      method: "PUT",
      body: JSON.stringify({ device_ids: [deviceId], play: true }),
    })
  }

  const playOnActiveDevice = async () => {
    if (!token) return Alert.alert("Spotify", "Please authorize first.")
    try {
      let res = await api("/me/player/play", {
        method: "PUT",
        body: JSON.stringify({ uris: [TRACK_URI] }),
      })

      if (res.status === 404 || res.status === 403 || res.status === 202) {
        const devices = await getDevices()
        const active = devices.find((d) => d.is_active && !d.is_restricted)
        const iphone =
          devices.find((d) => d.type === "Smartphone" && !d.is_restricted) ||
          devices[0]
        const target = active ?? iphone
        if (!target)
          throw new Error(
            "No available devices. Open Spotify once on your phone."
          )

        await transferPlayback(target.id)
        await new Promise((r) => setTimeout(r, 400))
        res = await api(
          `/me/player/play?device_id=${encodeURIComponent(target.id)}`,
          {
            method: "PUT",
            body: JSON.stringify({ uris: [TRACK_URI] }),
          }
        )
      }

      if (!res.ok && res.status !== 204) {
        const txt = await res.text()
        throw new Error(`play error ${res.status}: ${txt}`)
      }

      // ⏱ Start snippet loop
      await seekTo(SNIPPET_START_MS)
      startSnippetLoop()
      Alert.alert("Playback", "Looping 0:37 to 1:07!")
    } catch (e: any) {
      Alert.alert("Playback error", String(e?.message ?? e))
    }
  }

  // Seeks to a timestamp in ms
  const seekTo = async (ms: number) => {
    if (!token) return
    await api(`/me/player/seek?position_ms=${ms}`, { method: "PUT" })
  }

  // Snippet looping logic
  const startSnippetLoop = () => {
    if (!token) return
    // clear existing loop
    if (pollingRef.current) clearInterval(pollingRef.current)

    pollingRef.current = setInterval(async () => {
      try {
        const res = await api("/me/player")
        if (!res.ok) return
        const data = (await res.json()) as PlaybackState
        const pos = data.progress_ms ?? 0

        // If we go past the snippet end, seek back to start
        if (pos > SNIPPET_END_MS) {
          await seekTo(SNIPPET_START_MS)
        }

        setPlayback(data)
      } catch {
        // ignore
      }
    }, 500) // check every 500ms
  }

  const fetchPlayback = async () => {
    if (!token) return
    try {
      // GET /me/player returns current item, progress, is_playing
      const res = await api("/me/player")
      if (res.status === 204) return // no content (no active playback)
      if (!res.ok) return // ignore for now
      const data = (await res.json()) as PlaybackState
      setPlayback(data)
    } catch {
      // ignore transient failures
    }
  }

  // start/stop polling when token exists
  useEffect(() => {
    if (!token) {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
        pollingRef.current = null
      }
      setPlayback(null)
      return
    }
    // initial fetch right away
    fetchPlayback()
    // poll every 1s
    pollingRef.current = setInterval(fetchPlayback, 1000)
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
      pollingRef.current = null
    }
  }, [token])

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000)
    const m = Math.floor(s / 60)
    const ss = String(s % 60).padStart(2, "0")
    return `${m}:${ss}`
  }

  const progressPct = useMemo(
    () => (durationMs ? Math.min(1, progressMs / durationMs) : 0),
    [progressMs, durationMs]
  )

  const stopSnippet = async () => {
    if (!token) return
    try {
      await fetch("https://api.spotify.com/v1/me/player/pause", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      Alert.alert("Snippet", "Playback paused.")
    } catch (e: any) {
      Alert.alert("Pause error", String(e?.message ?? e))
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Spotify Auth + Play (Web API)</Text>
      <Button title="Authorize Spotify" onPress={authorize} />
      <Button
        title="Play Track on Device"
        onPress={playOnActiveDevice}
        disabled={!token}
      />
      <Button title="Stop Snippet" onPress={stopSnippet} disabled={!token} />

      {/* Now Playing UI */}
      {playback?.item ? (
        <View style={styles.nowPlaying}>
          {!!albumArt && (
            <Image
              source={{ uri: albumArt }}
              style={styles.art}
              resizeMode="cover"
            />
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.track} numberOfLines={1}>
              {title}
            </Text>
            <Text style={styles.artist} numberOfLines={1}>
              {artist}
            </Text>

            {/* progress bar */}
            <View style={styles.barBg}>
              <View style={[styles.barFill, { flex: progressPct }]} />
              <View style={{ flex: 1 - progressPct }} />
            </View>

            <View style={styles.timeRow}>
              <Text style={styles.time}>{formatTime(progressMs)}</Text>
              <Text style={styles.time}>{formatTime(durationMs)}</Text>
            </View>
            <Text style={styles.playState}>
              {playback.is_playing ? "Playing" : "Paused"}
            </Text>
          </View>
        </View>
      ) : (
        <Text style={{ opacity: 0.7, marginTop: 8 }}>
          Tip: open the Spotify app once so your phone is an active device.
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 12,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: { fontSize: 18, fontWeight: "600" },
  nowPlaying: {
    marginTop: 16,
    width: "100%",
    maxWidth: 520,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  art: { width: 80, height: 80, borderRadius: 6, backgroundColor: "#222" },
  track: { fontSize: 16, fontWeight: "700", color: "white" },
  artist: { fontSize: 14, opacity: 0.8, marginTop: 2, color: "white" },
  barBg: {
    marginTop: 8,
    height: 4,
    width: "100%",
    backgroundColor: "#ddd",
    borderRadius: 2,
    flexDirection: "row",
    overflow: "hidden",
  },
  barFill: { backgroundColor: "#1DB954" },
  timeRow: {
    marginTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  time: { fontSize: 12, opacity: 0.7, color: "white" },
  playState: { marginTop: 4, fontSize: 12, opacity: 0.7 },
})