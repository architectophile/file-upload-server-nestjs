import {
  Body,
  Controller,
  Get,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Express } from "express";
import { AppService } from "./app.service";
import { SampleDto } from "./sample.dto";
import { diskStorage } from "multer";
import { join } from "path";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  sayHello() {
    return this.appService.getHello();
  }

  @Post("upload")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: (req, file, cb) => {
          cb(null, join(process.cwd(), "downloads"));
        },
        filename: (req, file, cb) => {
          cb(null, file.originalname);
        },
      }),
    })
  )
  uploadData(@UploadedFile() file: Express.Multer.File) {
    console.log("file: ", file);
    return {
      file: file.originalname,
    };
  }

  @UseInterceptors(FileInterceptor("file"))
  @Post("file")
  uploadFile(
    @Body() body: SampleDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    return {
      body,
      file: file.buffer.toString(),
    };
  }

  @UseInterceptors(FileInterceptor("file"))
  @Post("file/pass-validation")
  uploadFileAndPassValidation(
    @Body() body: SampleDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: "json",
        })
        .build({
          fileIsRequired: false,
        })
    )
    file?: Express.Multer.File
  ) {
    return {
      body,
      file: file?.buffer.toString(),
    };
  }

  @UseInterceptors(FileInterceptor("file"))
  @Post("file/fail-validation")
  uploadFileAndFailValidation(
    @Body() body: SampleDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: "jpg",
        })
        .build()
    )
    file: Express.Multer.File
  ) {
    return {
      body,
      file: file.buffer.toString(),
    };
  }
}
