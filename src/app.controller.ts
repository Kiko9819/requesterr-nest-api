import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {

  constructor(private appService: AppService) {}

  // TODO: move these to a better place
  // and make sure to have proper endpoint names

  @Delete('/delete-token/:id')
  deleteToken(@Param('id') id) {
    return this.appService.deleteToken(id);
  }

  @Post('set-token')
  setToken(@Body() body) {
    return this.appService.setToken(body.key, body.value);
  }

  @Get('/get-token/:id')
  getToken(@Param('id') id){
    return this.appService.getToken(id);
  }
}
