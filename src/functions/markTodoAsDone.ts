import 'dotenv/config';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { checksExistingTodo } from 'src/utils/checkExistingTodo';

import { document } from '../utils/dynamodbClient';

/** Marcar uma tarefa como feita. */
export const handle: APIGatewayProxyHandler = async (event) => {
  const { id } = event.pathParameters;

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

  todo.done = true;

  // Atualiza os dados no DynamoDB
  await document
    .update({
      TableName: 'todos',
      Key: {
        id,
        user_id: todo.user_id,
      },
      UpdateExpression: 'set done = :true',
      ExpressionAttributeValues: {
        ':true': true,
      },
      ReturnValues: 'UPDATED_NEW',
    })
    .promise();

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Todo successfully marked as done',
      todo,
    }),
    headers: {
      'Content-type': 'application/json',
    },
  };
};
