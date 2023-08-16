import { Request, Response } from 'express';

const games = [
  {
    id: 1,
    name: 'Some game name 0',
    description: 'Some description 0',
    difficulty: 'low',
    relatedSkills: ['lol2', 'hehe5'],
  },
  {
    id: 2,
    name: 'Some game name 1',
    description: 'Some description 1',
    difficulty: 'medium',
    relatedSkills: ['asdf1', 'hehe5'],
  },
  {
    id: 3,
    name: 'Some game name 2',
    description: 'Some description 2',
    difficulty: 'high',
    relatedSkills: ['asdf1', 'lol2'],
  },
];

export const getGames = (req: Request, res: Response): void => {
  res.status(200).json({ userId: req.user.id, games });
};
