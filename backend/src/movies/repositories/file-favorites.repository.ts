import { Injectable } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";
import { MovieDto } from "../dto/movie.dto";
import { IFavoritesRepository } from "./favorites.repository.interface";

@Injectable()
export class FileFavoritesRepository implements IFavoritesRepository {
  private readonly filePath: string;
  private readonly dataDir: string;

  constructor() {
    this.dataDir = path.join(process.cwd(), "data");
    this.filePath = path.join(this.dataDir, "favorites.json");
    this.ensureDirectoryExists();
  }

  private ensureDirectoryExists(): void {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  private readFile(): MovieDto[] {
    try {
      if (!fs.existsSync(this.filePath)) {
        return [];
      }

      const fileContent = fs.readFileSync(this.filePath, "utf-8");
      if (!fileContent.trim()) {
        return [];
      }

      const parsed = JSON.parse(fileContent) as unknown;
      return Array.isArray(parsed) ? (parsed as MovieDto[]) : [];
    } catch (error) {
      console.error("Error reading favorites file:", error);
      return [];
    }
  }

  private writeFile(data: MovieDto[]): void {
    try {
      this.ensureDirectoryExists();
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), "utf-8");
    } catch (error) {
      console.error("Error writing favorites file:", error);
      throw new Error("Failed to save favorites to file");
    }
  }

  async findAll(): Promise<MovieDto[]> {
    return Promise.resolve(this.readFile());
  }

  async findById(id: string): Promise<MovieDto | null> {
    const favorites = this.readFile();
    return Promise.resolve(
      favorites.find((movie) => movie.imdbID === id) || null,
    );
  }

  async create(movie: MovieDto): Promise<MovieDto> {
    const favorites = this.readFile();

    // Check if movie already exists
    const exists = favorites.some((fav) => fav.imdbID === movie.imdbID);
    if (exists) {
      throw new Error("Movie already in favorites");
    }

    favorites.push(movie);
    this.writeFile(favorites);
    return Promise.resolve(movie);
  }

  async delete(id: string): Promise<boolean> {
    const favorites = this.readFile();
    const initialLength = favorites.length;
    const filtered = favorites.filter((movie) => movie.imdbID !== id);

    if (filtered.length === initialLength) {
      return Promise.resolve(false); // Movie not found
    }

    this.writeFile(filtered);
    return Promise.resolve(true);
  }

  async exists(id: string): Promise<boolean> {
    const movie = await this.findById(id);
    return Promise.resolve(movie !== null);
  }
}
