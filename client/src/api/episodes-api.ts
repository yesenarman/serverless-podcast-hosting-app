import { apiEndpoint } from '../config'
import Axios from 'axios'
import { Episode } from '../types/Episode'
import { CreateEpisodeRequest } from '../types/CreateEpisodeRequest'
import { UpdateEpisodeRequest } from '../types/UpdateEpisodeRequest'

export async function getEpisodes(idToken: string, podcastId: string): Promise<Episode[]> {
  console.log('Fetching podcast episodes')

  const response = await Axios.get(`${apiEndpoint}/podcasts/${podcastId}/episodes`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Podcast episodes:', response.data)
  return response.data.items
}

export async function createEpisode(
  idToken: string,
  podcastId: string,
  newEpisode: CreateEpisodeRequest
): Promise<Episode> {
  const response = await Axios.post(`${apiEndpoint}/podcasts/${podcastId}/episodes`,  JSON.stringify(newEpisode), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

export async function patchEpisode(
  idToken: string,
  podcastId: string,
  episodeId: string,
  updatedEpisode: UpdateEpisodeRequest
): Promise<void> {
  await Axios.patch(`${apiEndpoint}/podcasts/${podcastId}/episodes/${episodeId}`, JSON.stringify(updatedEpisode), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function deleteEpisode(
  idToken: string,
  podcastId: string,
  episodeId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/podcasts/${podcastId}/episodes/${episodeId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function getAudioUploadUrl(
  idToken: string,
  podcastId: string,
  episodeId: string
): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/podcasts/${podcastId}/episodes/${episodeId}/audio`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.uploadUrl
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}
