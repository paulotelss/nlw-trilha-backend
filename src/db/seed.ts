import { client, db } from '.'
import { goalCompletions, goals } from './schema'
import dayjs from 'dayjs'

async function seed() {
  await db.delete(goalCompletions)
  await db.delete(goals)

  const result = await db
    .insert(goals)
    .values([
      { title: 'Acordar cedo', desiredWeeklyFrequency: 5 },
      { title: 'Me exercitar', desiredWeeklyFrequency: 3 },
      { title: 'Meditar', desiredWeeklyFrequency: 1 },
    ])
    .returning()

  // Define a data de início da semana e ajusta os horários para metas predefinidas
  const startOfWeek = dayjs().startOf('week')

  const today = dayjs()

  // Ajusta o horário para 6h da manhã
  const adjustTime = (date: dayjs.Dayjs, hours: number, minutes: number) =>
    date.hour(hours).minute(minutes).second(0).millisecond(0)

  const values = [
    {
      goalId: result[0].id,
      createdAt: adjustTime(startOfWeek, 6, 0).toDate(), // Ajustado para 6h da manhã
    },
    today.isAfter(startOfWeek.add(1, 'day'))
      ? {
          goalId: result[1].id,
          createdAt: adjustTime(startOfWeek.add(1, 'day'), 6, 0).toDate(), // Ajustado para 6h da manhã
        }
      : null,
    today.isAfter(startOfWeek.add(2, 'day'))
      ? {
          goalId: result[2].id,
          createdAt: adjustTime(startOfWeek.add(2, 'day'), 6, 0).toDate(), // Ajustado para 6h da manhã
        }
      : null,
  ].filter(value => value !== null) // Filtra os valores `null`

  await db.insert(goalCompletions).values(values)
}

seed().finally(() => {
  client.end()
})
