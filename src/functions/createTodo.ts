import 'dotenv/config';
import { APIGatewayProxyHandler } from 'aws-lambda';
import dayjs from 'dayjs';
import { checksExistingUser } from 'src/utils/checkExistingUser';
import { v4 as uuidV4 } from 'uuid';

import { document } from '../utils/dynamodbClient';

interface ICreateTodo {
  title: string;
  deadline: Date;
}

/** Cadastrar uma nova tarefa para um usuário. */
export const handle: APIGatewayProxyHandler = async (event) => {
  const { user_id } = event.pathParameters;
  const { title, deadline } = JSON.parse(event.body) as ICreateTodo;

  const user = await checksExistingUser(user_id);
  if (!user) {
    // Usuário não encontrado
    return {
      statusCode: 404,
      body: JSON.stringify({
        message: 'User does not exist',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }

  // Monta o objeto Tarefa
  const todo = {
    id: uuidV4(),
    user_id,
    title,
    done: false,
    deadline: dayjs(deadline).format('DD/MM/YYYY'),
  };

  // Insere os dados no DynamoDB
  await document
    .put({
      TableName: 'todos',
      Item: todo,
    })
    .promise();

  return {
    statusCode: 201,
    body: JSON.stringify({
      message: 'Todo created',
      todo,
    }),
    headers: {
      'Content-type': 'application/json',
    },
  };
};
