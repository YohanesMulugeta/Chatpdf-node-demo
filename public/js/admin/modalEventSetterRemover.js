// REFACTORE GARBAGE COLLECTION
export default function garbageCollector(modal, elementEventOpt) {
  // elementEventOpt : event, handler, bindOpt
  const handler = elementEventOpt.handler.bind(elementEventOpt.bindOpt);
  elementEventOpt.target.addEventListener(elementEventOpt.event, handler);
  elementEventOpt.bindOpt.handler = handler;

  // collecting evelnt listners after the modalis hidden
  const handleHideEvent = function (e) {
    elementEventOpt.target.removeEventListener(elementEventOpt.event, handler);
    e.target.removeEventListener('hide.bs.modal', this.hideHandler);
  };

  const bindOpt = {};
  const hideHandler = handleHideEvent.bind(bindOpt);
  bindOpt.hideHandler = hideHandler;

  modal.addEventListener('hide.bs.modal', hideHandler);
}
