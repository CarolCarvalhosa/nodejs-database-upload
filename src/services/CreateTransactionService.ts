import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    type,
    value,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);
    if (type === 'outcome') {
      const { total } = await transactionsRepository.getBalance();
      if (total - value < 0) {
        throw new AppError('Balance not valid');
      }
    }
    let categoryFound = await categoriesRepository.findOne({
      where: {
        title: category,
      },
    });
    if (!categoryFound) {
      categoryFound = categoriesRepository.create({
        title: category,
      });
      await categoriesRepository.save(categoryFound);
    }
    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category: categoryFound,
    });
    await transactionsRepository.save(transaction);
    return transaction;
  }
}

export default CreateTransactionService;
