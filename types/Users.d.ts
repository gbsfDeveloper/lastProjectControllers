export declare interface Student {
  id: string;
  nickname: string;
  playedGames: Array<string>;
  skillDeveloped: string;
  excercises: Array<string>;
}

export declare interface Parent {
  id: string;
  email: string;
  students: Array<Student>;
  password: string;
  visitedSkills: Array<string>;
}
