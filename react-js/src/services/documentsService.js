import Axios from 'axios';
import download from 'downloadjs';
import environment from '../environments/environment';

export default class DocumentsService {
  getMaintenanceInvoicesList(propertyId) {
    return new Promise((resolve, reject) => {
      this.getMaintenanceInvoicesListGet(propertyId)
        .then((response) => {
          if (response.data.flag !== 0) {
            resolve(response.data.data);
          } else {
            reject(response.msg);
          }
        })
        .catch((error) => reject(error));
    });
  }

  getFurnishingInvoicesList(propertyId) {
    return new Promise((resolve, reject) => {
      this.getFurnishingInvoicesListGet(propertyId)
        .then((response) => {
          if (response.data.flag !== 0) {
            resolve(response.data.data);
          } else {
            reject(response.msg);
          }
        })
        .catch((error) => reject(error));
    });
  }

  getStatementFile(url, title, year, month) {
    return new Promise((resolve, reject) => {
      this.getFileGet(url)
        .then((response) => {
          const blob = new Blob([response.data]);

          if (typeof window.cordova !== 'undefined') {
            this.saveBlob2File(`statement-${title}_${month}-${year}.pdf`, blob);
            resolve();

            return;
          }

          const content = response.headers['content-type'];
          download(response.data, `statement-${title}_${month}-${year}.pdf`, content);
          resolve();
        })
        .catch((error) => reject(error));
    });
  }

  getMaintenanceInvoice(filePath, title, year, month) {
    return new Promise((resolve, reject) => {
      this.getFileGet(`${environment.ownerApi}/${filePath}`)
        .then((response) => {
          const blob = new Blob([response.data]);

          if (typeof window.cordova !== 'undefined') {
            this.saveBlob2File(`maintenance-${title}_${month}-${year}.pdf`, blob);
            resolve();

            return;
          }

          const content = response.headers['content-type'];
          download(response.data, `maintenance-${title}_${month}-${year}.pdf`, content);
          resolve();
        })
        .catch((error) => reject(error));
    });
  }

  getMaintenanceInvoicesListGet(propertyId) {
    return Axios.get(`${environment.ownerApi}/invoice_list_maintenance?property_id=${propertyId}`, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  }

  getFurnishingInvoicesListGet(propertyId) {
    return Axios.get(`${environment.ownerApi}/invoice_list_furnishing?property_id=${propertyId}`, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  }

  getFileGet(filePath) {
    return Axios.get(filePath, {
      responseType: 'blob',
    });
  }

  saveBlob2File(fileName, blob) {
    const folder = `${cordova.file?.dataDirectory}`;

    window.resolveLocalFileSystemURL(
      folder,
      (dirEntry) => {
        this.createFile(dirEntry, fileName, blob);
      },
      this.onErrorLoadFs
    );
  }

  createFile(dirEntry, fileName, blob) {
    dirEntry.getFile(
      fileName,
      { create: true, exclusive: false },
      (fileEntry) => {
        this.writeFile(fileEntry, blob);
      },
      this.onErrorCreateFile
    );
  }

  writeFile(fileEntry, dataObj) {
    fileEntry.createWriter((fileWriter) => {
      fileWriter.onwriteend = () => {
        cordova.plugins.fileOpener2.open(fileEntry.toURL(), 'application/pdf', {
          error: () => {
            navigator.notification.alert('Error Opening the File.Unsupported document format.');
          },
          success: () => {},
        });

        // window.open(fileEntry.toURL(), '_system', 'location=yes');
      };

      fileWriter.onerror = () => {};
      fileWriter.write(dataObj);
    });
  }

  onErrorLoadFs() {}

  onErrorCreateFile() {}
}

export const documentsService = new DocumentsService();
