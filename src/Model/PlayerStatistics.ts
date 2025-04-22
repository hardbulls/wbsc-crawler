export type PlayerStatistics = {
  name: string;
  statistics: {
    batting?: {
      [key: string]: number | string;
    };
    pitching?: {
      [key: string]: number | string;
    };
    fielding?: {
      [key: string]: number | string;
    };
  };
};
