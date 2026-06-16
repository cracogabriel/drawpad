import { createConsumer, type Subscription } from '@rails/actioncable'
import { useEffect, useRef, useCallback } from 'react'
import type { ActionCableOptions } from '../types'

export function useActionCable({
  url,
  channelParams,
  onReceived,
  onConnected,
  onDisconnected,
}: ActionCableOptions) {
  const consumerRef = useRef<ReturnType<typeof createConsumer> | null>(null)
  const subscriptionRef = useRef<Subscription | null>(null)
  const handlersRef = useRef({ onReceived, onConnected, onDisconnected })

  handlersRef.current = { onReceived, onConnected, onDisconnected }

  const perform = useCallback((action: string, data?: object) => {
    subscriptionRef.current?.perform(action, data)
  }, [])

  useEffect(() => {
    if (!channelParams) return

    const consumer = createConsumer(url)
    consumerRef.current = consumer

    const subscription = consumer.subscriptions.create(
      { channel: channelParams.channel, room_id: channelParams.room_id },
      {
        received(data: Record<string, unknown>) {
          handlersRef.current.onReceived?.(data)
        },
        connected() {
          handlersRef.current.onConnected?.()
        },
        disconnected() {
          handlersRef.current.onDisconnected?.()
        },
      }
    )
    subscriptionRef.current = subscription

    return () => {
      subscription.unsubscribe()
      consumer.disconnect()
      subscriptionRef.current = null
      consumerRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, channelParams?.channel, channelParams?.room_id])

  return { perform }
}
