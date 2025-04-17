import $ from 'jquery';
import 'bootstrap-datepicker';
import 'bootstrap-datepicker/dist/css/bootstrap-datepicker.min.css';

/**
 * Initialize date and time pickers
 */
export function initDatepickers() {
  // Initialize date picker
  $('.datepicker').datepicker({
    format: 'yyyy-mm-dd',
    autoclose: true,
    todayHighlight: true,
    clearBtn: true
  });

  // Initialize time picker
  $('.timepicker').timepicker({
    timeFormat: 'HH:mm',
    interval: 30,
    minTime: '00:00',
    maxTime: '23:30',
    defaultTime: 'now',
    startTime: '00:00',
    dynamic: false,
    dropdown: true,
    scrollbar: true
  });
} 