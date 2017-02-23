// Imports
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

// Declarations
import { AppComponent } from './app.component';
import { CmsComponent } from './cms/cms.component';
import { HeaderComponent } from './general/header/header.component';
import { FooterComponent } from './general/footer/footer.component';

// Providers
import { ContentDeveloperServerService } from './services/content-developer-server/content-developer-server.service';

@NgModule({
  declarations: [
    AppComponent,
    CmsComponent,
    HeaderComponent,
    FooterComponent,
    ContentDeveloperServerService
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
