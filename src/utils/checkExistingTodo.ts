import { ITodo } from 'src/interfaces/ITodo';

import { document } from './dynamodbClient';

/** Verificar se a tarefa está cadastrada. */
export async function checksExistingTodo(todo_id: string): Promise<ITodo> {
  // Verifica se o todo_id está cadastrado
  const response = await document
    .query({
      TableName: 'todos',
      KeyConditionExpression: 'id = :todo_id',
      ExpressionAttributeValues: {
        ':todo_id': todo_id,
      },
    })
    .promise();
  const todoExists = response.Items[0] as ITodo;

  return todoExists;
}
