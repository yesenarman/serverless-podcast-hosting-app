import { apiEndpoint } from '../config'
import Axios from 'axios'
import { Podcast } from '../types/Podcast'
import { CreatePodcastRequest } from '../types/CreatePodcastRequest'
import { UpdatePodcastRequest } from '../types/UpdatePodcastRequest'

export async function getPodcasts(idToken: string): Promise<Podcast[]> {
  console.log('Fetching podcasts')

  const response = await Axios.get(`${apiEndpoint}/podcasts`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Podcasts:', response.data)
  return response.data.items
}

export async function createPodcast(
  idToken: string,
  newPodcast: CreatePodcastRequest
): Promise<Podcast> {
  const response = await Axios.post(`${apiEndpoint}/podcasts`,  JSON.stringify(newPodcast), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

export async function patchPodcast(
  idToken: string,
  podcastId: string,
  updatedPodcast: UpdatePodcastRequest
): Promise<void> {
  await Axios.patch(`${apiEndpoint}/podcasts/${podcastId}`, JSON.stringify(updatedPodcast), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function deletePodcast(
  idToken: string,
  podcastId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/podcasts/${podcastId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function getCoverImageUploadUrl(
  idToken: string,
  podcastId: string
): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/podcasts/${podcastId}/coverimage`, '', {
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
