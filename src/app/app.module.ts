// Imports
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

// Pipes
import { KeyValArrayPipe } from './pipes/key-val-array.pipe';
import { CustomJsonPipe } from './pipes/custom-json.pipe';
import { CloneObjectPipe } from './pipes/clone-object.pipe';
import { UpperCamelCasePipe } from './pipes/upper-camel-case.pipe';
import { UnderscoreToSpacePipe } from './pipes/underscore-to-space.pipe';
import { TitlePipe } from './pipes/title.pipe';
import { ShortenerPipe } from './pipes/shortener.pipe';
import { CustomDatePipe } from './pipes/custom-date.pipe';
import { DoubleDigitPipe } from './pipes/double-digit.pipe';

// Services
import { ContentDeveloperServerService } from './services/content-developer-server/content-developer-server.service';

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
import { StructureViewComponent } from './cms/admin/structure-view/structure-view.component';
import { ContentViewComponent } from './cms/reusable/content-view/content-view.component';
import { HistoryViewComponent } from './cms/admin/history-view/history-view.component';
import { SettingsViewComponent } from './cms/admin/settings-view/settings-view.component';
import { HistoryDisplayComponent } from './cms/reusable/history-display/history-display.component';
import { HistoryPreviewComponent } from './cms/reusable/history-preview/history-preview.component';
import { UserProjectsComponent } from './cms/user-projects/user-projects.component';
import { LoginComponent } from './login/login.component';
import { MediaItemGalleryComponent } from './cms/reusable/media-item-gallery/media-item-gallery.component';
import { MediaItemComponent } from './cms/reusable/media-item/media-item.component';
import { DraggableContainerDirective } from './cms/reusable/draggable-container/draggable-container.directive';
import { CodeEditorComponent } from './cms/reusable/code-editor/code-editor.component';
import { ViewOnlyComponent } from './cms/view-only/view-only.component';


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
    CustomJsonPipe,
    StructureViewComponent,
    ContentViewComponent,
    HistoryViewComponent,
    SettingsViewComponent,
    CloneObjectPipe,
    UpperCamelCasePipe,
    UnderscoreToSpacePipe,
    TitlePipe,
    HistoryDisplayComponent,
    ShortenerPipe,
    CustomDatePipe,
    DoubleDigitPipe,
    HistoryPreviewComponent,
    UserProjectsComponent,
    LoginComponent,
    MediaItemGalleryComponent,
    MediaItemComponent,
    DraggableContainerDirective,
    CodeEditorComponent,
    ViewOnlyComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [
    ContentDeveloperServerService,
    CustomJsonPipe,
    CloneObjectPipe,
    UpperCamelCasePipe,
    UnderscoreToSpacePipe,
    TitlePipe,
    ShortenerPipe,
    CustomDatePipe,
    DoubleDigitPipe,
    KeyValArrayPipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
