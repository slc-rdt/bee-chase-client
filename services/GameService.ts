import axios, { AxiosResponse } from 'axios';
import { Game } from '../models/Game';
import { GameTeam, GameTeamRank } from '../models/GameTeam';
import { PaginatedSubmission } from '../models/PaginatedSubmissions';
import { BaseService } from './BaseService';

export class GameService extends BaseService {
  public async getByCode(code: string) {
    const response: AxiosResponse<Game> = await axios.get(
      `${this.API_URL}/games/${code.toUpperCase()}/code`,
      this.headerWithToken(),
    );
    return response.data;
  }

  public async verifyPasscode(gameId: string, passcode: string) {
    const response: AxiosResponse<boolean> = await axios.post(
      `${this.API_URL}/games/${gameId}/verify`,
      { passcode },
      this.headerWithToken(),
    );
    return response.data;
  }

  public async get(id: string) {
    const response: AxiosResponse<Game> = await axios.get(
      `${this.API_URL}/games/${id}`,
      this.headerWithToken(),
    );
    return response.data;
  }

  public async getLeaderboard(id: string) {
    const response: AxiosResponse<(GameTeam & GameTeamRank)[]> = await axios.get(
      `${this.API_URL}/games/${id}/leaderboard`,
      this.headerWithToken(),
    );
    return response.data;
  }

  public async getCurrentJoinedGames() {
    const response: AxiosResponse<Game[]> = await axios.get(
      `${this.API_URL}/games?player=true`,
      this.headerWithToken(),
    );
    return response.data;
  }

  public async getAllSubmissions(gameId: string, page: number = 1, limit: number = 5) {
    const response: AxiosResponse<PaginatedSubmission> = await axios.get(
      `${this.API_URL}/games/${gameId}/submissions?page=${page}&limit=${limit}`,
      this.headerWithToken(),
    );
    return response.data;
  }
}
