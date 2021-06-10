import 'dotenv/config';
import { APIGatewayProxyHandler } from 'aws-lambda';
import dayjs from 'dayjs';
import { checksExistingTodo } from 'src/utils/checkExistingTodo';

import { document } from '../utils/dynamodbClient';

interface IUpdateTodo {
  title?: string;
  deadline?: Date;
}

/** Marcar uma tarefa como feita. */
export const handle: APIGatewayProxyHandler = async (event) => {
  const { id } = event.pathParameters;
  const { title, deadline } = JSON.parse(event.body) as IUpdateTodo;

  const todo = await checksExistingTodo(id);
  if (!todo) {
    // Tarefa não encontrada
    return {
      statusCode: 404,
      body: JSON.stringify({
        message: 'Todo does not exist',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }

  if (title) {
    todo.title = title;
  }
  if (deadline) {
    const formattedDeadline = dayjs(deadline).format('DD/MM/YYYY');
    todo.deadline = formattedDeadline;
  }

  // Atualiza os dados no DynamoDB
  await document
    .update({
      TableName: 'todos',
      Key: {
        id,
        user_id: todo.user_id,
      },
      UpdateExpression: 'set title = :title, deadline = :deadline',
      ExpressionAttributeValues: {
        ':title': todo.title,
        ':deadline': todo.deadline,
      },
      ReturnValues: 'UPDATED_NEW',
    })
    .promise();

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Todo successfully updated',
      todo,
    }),
    headers: {
      'Content-type': 'application/json',
    },
  };
};
