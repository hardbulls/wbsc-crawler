export type PlayerStatistics = {
  name: string;
  statistics: {
    batting?: {
      [key: string]: number;
    };
    pitching?: {
      [key: string]: number;
    };
    fielding?: {
      [key: string]: number;
    };
  };
};
