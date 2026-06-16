import axios from 'axios'
import type { Figure } from '../types'

export async function fetchRoom(roomName: string): Promise<Figure[]> {
  const res = await axios.get<{ figures: Figure[] }>(`/api/v1/rooms/${roomName}`)
  return res.data.figures ?? []
}
