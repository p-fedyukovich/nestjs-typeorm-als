export const NOT_FOUND_USER_WITH_ID = (userId: number) =>
  `Not found user with id = ${userId}`;
export const NOT_FOUND_PURSE_WITH_USER_ID = (userId: number) =>
  `Not found purse with userId = ${userId}`;
export const NOT_FOUND_PURSE_WITH_PURSE_ID = (purseId: number) =>
  `Not found purse with purse = ${purseId}`;
export const USER_DOES_NOT_HAVE_PURSE = (userId: number) =>
  `User with id = ${userId} doesnt have a default purse`;
export const NOT_ENOUGH_MONEY = (userId: number) =>
  `User with id = ${userId} does not have enough money`;
