import { PubSubEngine } from 'graphql-subscriptions'
import { PubSub, Message } from '@google-cloud/pubsub'

const { GCLOUD_PROJECT_ID } = process.env

// Name of topic and subscription created in Google cloud pubsub
type TopicName = 'blockchain-notifications'
type SubscriptionName = 'address_updated'
type SubscriptionInfo = {
  handler: (message: Message) => void
  triggerName: SubscriptionName
}

export default class GCPPubSub extends PubSubEngine {
  private pubsub: PubSub
  private handlerMap = new Map<number, SubscriptionInfo>()

  constructor() {
    super()
    this.pubsub = new PubSub({ projectId: GCLOUD_PROJECT_ID })
  }

  // Get topic
  async getPubSubTopic(topicName: TopicName) {
    const [topics] = await this.pubsub.getTopics()
    const topic = topics.find(
      (t) => t.name === `projects/${GCLOUD_PROJECT_ID}/topics/${topicName}`
    )

    if (!topic) throw new Error('No topic found')
    return topic
  }

  // Get subscription
  async getPubSubSubscription(
    topicName: TopicName,
    subscriptionName: SubscriptionName
  ) {
    // Get the topic
    const topic = await this.getPubSubTopic(topicName)

    if (!topic) throw new Error('No topic found')

    // Get subscription
    const [subscriptions] = await topic.getSubscriptions()
    const subscription = subscriptions.find(
      (sub) =>
        sub.name ===
        `projects/${GCLOUD_PROJECT_ID}/subscriptions/${subscriptionName}`
    )

    if (!subscription) throw new Error('No subscription found')

    return subscription
  }

  public async publish<T extends Record<string, any>>(
    triggerName: TopicName,
    payload: T
  ): Promise<void> {
    // Convert payload to Buffer
    const dataBuffer = Buffer.from(JSON.stringify(payload))
    // Get topic
    const topic = await this.getPubSubTopic(triggerName)
    // Publish the payload
    await this.pubsub.topic(topic.name).publishMessage({ data: dataBuffer })
  }

  public async subscribe(
    triggerName: SubscriptionName,
    onMessage: (...args: unknown[]) => void
  ): Promise<number> {
    const id = Date.now() * Math.random()

    // References an existing subscription
    const subscription = await this.getPubSubSubscription(
      'blockchain-notifications',
      triggerName
    )

    // Handler function
    const handler = (message: Message) => {
      // Pass data to onMessage, we convert Buffer to object here
      onMessage(JSON.parse(message.data?.toString() || '{}'))

      // "Ack" (acknowledge receipt of) the message
      message.ack()
    }
    // Listen to messages
    subscription.on('message', handler)
    // Save id and handler so we can unsubscribe later
    this.handlerMap.set(id, { handler, triggerName })

    return Promise.resolve(id)
  }

  // Unsubscribe listening
  public async unsubscribe(subId: number) {
    const info = this.handlerMap.get(subId)
    if (!info) return

    const subscription = await this.getPubSubSubscription(
      'blockchain-notifications',
      info.triggerName
    )

    if (subscription) subscription.removeListener('message', info.handler)
  }
}

export const pubsub = new GCPPubSub()
