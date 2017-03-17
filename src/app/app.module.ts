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
import { AdminComponent } from './cms/cms-admin/admin.component';
import { EditorComponent } from './cms/cms-editor/editor.component';
import { HeaderComponent } from './general/header/header.component';
import { FooterComponent } from './general/footer/footer.component';
import { ContentEditorComponent } from './cms/reusable/content/content-editor/content-editor.component';
import { CollectionComponent } from './cms/reusable/content/collection/collection.component';
import { CollectionItemComponent } from './cms/reusable/content/collection-item/collection-item.component';
import { StructureViewComponent } from './cms/cms-admin/structure-view/structure-view.component';
import { ContentViewComponent } from './cms/reusable/content/content-view/content-view.component';
import { HistoryViewComponent } from './cms/cms-admin/history-view/history-view.component';
import { SettingsViewComponent } from './cms/reusable/settings/settings-view/settings-view.component';
import { HistoryDisplayComponent } from './cms/reusable/history/history-display/history-display.component';
import { HistoryPreviewComponent } from './cms/reusable/history/history-preview/history-preview.component';
import { UserProjectsComponent } from './cms/cms-user-projects/user-projects.component';
import { LoginComponent } from './login/login.component';
import { MediaItemGalleryComponent } from './cms/reusable/media-items/media-item-gallery/media-item-gallery.component';
import { MediaItemComponent } from './cms/reusable/media-items/media-item/media-item.component';
import { DraggableContainerDirective } from './cms/reusable/draggable-container/draggable-container.directive';
import { CodeEditorComponent } from './cms/reusable/code-editor/code-editor.component';
import { ViewOnlyComponent } from './cms/cms-view-only/view-only.component';
import { CollaboratorsComponent } from './cms/reusable/settings/collaborators/collaborators.component';
import { AccessLevelsComponent } from './cms/reusable/settings/access-levels/access-levels.component';
import { NavigationComponent } from './cms/reusable/cms-navigation/navigation.component';
import { WysiwygHtmlComponent } from './cms/reusable/content/wysiwyg-html/wysiwyg-html.component';
import { FileUploadComponent } from './cms/reusable/content/file-upload/file-upload.component';


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
    ViewOnlyComponent,
    CollaboratorsComponent,
    AccessLevelsComponent,
    NavigationComponent,
    WysiwygHtmlComponent,
    FileUploadComponent
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
