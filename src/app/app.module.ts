// Imports
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

// Components
import { AppComponent } from './app.component';
import { CmsComponent } from './cms/cms.component';
import { AdminComponent } from './cms/admin/admin.component';
import { EditorComponent } from './cms/editor/editor.component';
import { HeaderComponent } from './general/header/header.component';
import { FooterComponent } from './general/footer/footer.component';
import { ContentEditorComponent } from './cms/reusable/content-editor/content-editor.component';
import { CollectionComponent } from './cms/reusable/collection/collection.component';
import { CollectionItemComponent } from './cms/reusable/collection-item/collection-item.component';

// Pipes
import { KeyValArrayPipe } from './pipes/key-val-array.pipe';
import { CustomJsonPipe } from './pipes/custom-json.pipe';

// Providers
import { ContentDeveloperServerService } from './services/content-developer-server/content-developer-server.service';


@NgModule({
  declarations: [
    AppComponent,
    CmsComponent,
    AdminComponent,
    EditorComponent,
    HeaderComponent,
    FooterComponent,
    ContentEditorComponent,
    KeyValArrayPipe,
    CollectionComponent,
    CollectionItemComponent,
    CustomJsonPipe
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [ContentDeveloperServerService],
  bootstrap: [AppComponent]
})
export class AppModule { }
