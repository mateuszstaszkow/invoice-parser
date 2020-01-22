import { Component } from '@angular/core';

import * as pdfjs from 'pdfjs-dist';
import {Observable} from 'rxjs';

export class InvoiceItem {
  name: string;
  pkwiu: string;
  count: number;
  priceGross: number;
  vatPercent: number;
}

export class Invoice {
  name = '';
  items: InvoiceItem[] = [];
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'invoice-parser';
  public invoices: Invoice[] = [];

  fileChange(event) {
    const files: FileList = event.target.files;
    for (let i = 0; i < files.length; i++) {
      const file: File = files.item(i);
      this.parse(file);
    }
  }

  private parse(file: File) {
    if (file.type !== 'application/pdf') {
      console.error(file.name, 'is not a pdf file.');
      return;
    }
    // const composePage = this.composePage;
    const fileReader = new FileReader();
    fileReader.onload = function () {
      const typedArray = new Uint8Array(<any>this.result);
      pdfjs.getDocument(typedArray)
        .then(pdf => {
          pdf.getPage(1)
            .then(page => page.getTextContent())
            .then(pageText => {
              const invoice = new Invoice();
              const texts: string[] = pageText.items.map(item => item.str);
              for (let i = 0; i < texts.length; i++) {
                if (texts[i].includes('FAKTURA')) {
                  invoice.name = texts[i];
                }
              }
              console.log(pageText.items);
            });
        });
    };
    fileReader.readAsArrayBuffer(file);
  }

  private async composePage(pdf: any): Promise<Object[]> {
    const items = [];
    // for (let i = 1; i <= pdf.numPages; i++) {
    //   const pageText = await pdf.getPage(i)
    //     .then(page => page.getTextContent());
    //   items.concat(pageText.items);
    //   console.log(items)
    // }
    return items;
  }

  // private getPageText(pdf: any, items: Object[], index: number, pagesCount: number): Promise<Object[]> {
  //   if (index >= pagesCount) {
  //     return items;
  //   }
  //   return pdf.getPage(index)
  //     .then(page => page.getTextContent())
  //     .then(pageText => {
  //       const pageItems = pageText.items;
  //       items.concat(pageItems);
  //       return this.getPageText(pdf, items, ++index, pagesCount);
  //     });
  // }

  private drawPage(page: any) {
    const viewport = page.getViewport(2.0);
    const canvas = document.querySelector('canvas');
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    page.render({
      canvasContext: canvas.getContext('2d'),
      viewport: viewport
    });
  }
}
