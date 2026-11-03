import { Controller, Get, Query, Render } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('index')
  root() {
    return {
      title: 'Getalbeeld – visualiseer getallen met vormen',
      description:
        'Interactieve getalvisualisatie met vormen: leer tellen tot 10 of 20 met clusters (4-4-2) of een vloeiende rij. Gratis Nederlandstalige rekentool voor het basisonderwijs.',
    };
  }

  @Get('api/random')
  getRandomNumber(
    @Query('max') max?: string,
    @Query('exclude') exclude?: string,
  ): { value: number } {
    const excluded = exclude ? Number(exclude) : undefined;
    return {
      value: this.appService.getRandomNumber(Number(max) || 10, excluded),
    };
  }
}
