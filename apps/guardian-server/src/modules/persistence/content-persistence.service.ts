import { Injectable, Inject, Logger } from '@nestjs/common'
import type { Firestore } from 'firebase-admin/firestore'
import type { TaskProcessResponse } from '@primer-guidy/nest-shared'
import { FIREBASE_FIRESTORE } from '../../tokens'

const USERS_COLLECTION = 'users'
const CHANNELS_SUBCOLLECTION = 'channels'
const STUDENTS_SUBCOLLECTION = 'students'

const TASK_COLLECTION_MAP: Record<string, string> = {
  quiz: 'quizzes',
  homework: 'homework',
}

@Injectable()
export class ContentPersistenceService {
  private readonly logger = new Logger(ContentPersistenceService.name)

  constructor(@Inject(FIREBASE_FIRESTORE) private readonly firestore: Firestore) {}

  save(teacherUid: string, channelId: string, response: TaskProcessResponse): void {
    this.persist(teacherUid, channelId, response).catch((err) => {
      this.logger.error(`Failed to persist content: ${(err as Error).message}`)
    })
  }

  private async persist(
    teacherUid: string,
    channelId: string,
    response: TaskProcessResponse,
  ): Promise<void> {
    const collectionName = TASK_COLLECTION_MAP[response.task] ?? response.task
    const channelPath = `${USERS_COLLECTION}/${teacherUid}/${CHANNELS_SUBCOLLECTION}/${channelId}`
    const contentRef = this.firestore.collection(`${channelPath}/${collectionName}`).doc()

    const batch = this.firestore.batch()

    const { studentContents, ...mainData } = response
    batch.set(contentRef, {
      ...mainData,
      createdAt: new Date().toISOString(),
    })

    for (const student of studentContents) {
      const studentRef = contentRef
        .collection(STUDENTS_SUBCOLLECTION)
        .doc(student.identificationNumber)
      batch.set(studentRef, {
        questions: student.questions,
        chatContext: student.chatContext,
        metrics: student.metrics,
        completed: false,
        answered: false,
        selectedIndex: null,
        previousSelectedIndex: null,
      })
    }

    await batch.commit()
    this.logger.log(
      `Persisted ${collectionName} ${contentRef.id} with ${studentContents.length} students`,
    )
  }
}
