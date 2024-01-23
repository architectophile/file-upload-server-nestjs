import {
  Body,
  Controller,
  Get,
  ParseFilePipeBuilder,
  Post,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Express, Response } from "express";
import { AppService } from "./app.service";
import { SampleDto } from "./sample.dto";
import { diskStorage } from "multer";
import { join } from "path";
import { createReadStream } from "fs";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  sayHello() {
    return this.appService.getHello();
  }

  @Post("personal/parse/json")
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
  uploadData(
    @UploadedFile() file: Express.Multer.File,
    @Res({ passthrough: true }) res: Response
  ) {
    console.log("uploaded file: ", file);

    const fileStream = createReadStream(
      join(process.cwd(), "downloads", file.originalname)
    );

    fileStream.on("error", (error) => {
      console.error("Error while streaming file:", error);
      res.status(500).send("Error while streaming file");
    });

    return new StreamableFile(fileStream);
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
