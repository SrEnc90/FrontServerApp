import { NgModule } from '@angular/core';
import { NotifierOptions } from 'angular-notifier';

/**
 * ! Hemos importado la librería de angular-notifier ingresando la sgte línea de comando: npm i angular-notifier 
 * */
const notifierDefaultOptions: NotifierOptions = {
  position: {
    horizontal: {
      position: 'left',
      distance: 12,
    },
    vertical: {
      position: 'bottom',
      distance: 12,
      gap: 10,
    },
  },
  theme: 'material',
  behaviour: {
    autoHide: 5000,
    onClick: false,
    onMouseover: 'pauseAutoHide',
    showDismissButton: true,
    stacking: 4,
  },
  animations: {
    enabled: true,
    show: {
      preset: 'slide',
      speed: 300,
      easing: 'ease',
    },
    hide: {
      preset: 'fade',
      speed: 300,
      easing: 'ease',
      offset: 50,
    },
    shift: {
      speed: 300,
      easing: 'ease',
    },
    overlap: 150,
  },
};

@NgModule({
  // No pude implementar el notifierModule
  // imports: [ NotifierModule.withConfig(NotificationModule) ],
  // exports: [ NotifierModule ]
})
export class NotificationModule { }
