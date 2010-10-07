(function() {
  var _i, _len, _ref, accountsTab, codeReaderTab, codesTab, tab;
  Ti.include('app/controllers/accounts_controller.js');
  Ti.include('app/controllers/code_reader_controller.js');
  Ti.include('app/views/codes/codes_window.js');
  root.tabGroup = Titanium.UI.createTabGroup({
    barColor: '#336699'
  });
  Titanium.UI.setBackgroundColor('#000');
  root.CodeReaderController = new Zeebra.CodeReaderController();
  codeReaderTab = Titanium.UI.createTab({
    icon: 'KS_nav_views.png',
    title: 'Scanner',
    window: root.CodeReaderController.window.win
  });
  root.accountStore = new Zeebra.AccountSet();
  root.AccountsController = new Zeebra.AccountsController(root.accountStore);
  accountsTab = Titanium.UI.createTab({
    icon: 'KS_nav_views.png',
    title: 'Accounts',
    window: root.AccountsController.window.win
  });
  root.CodesWindow = new Zeebra.CodesWindow('Codes', 'No Codes scanned yet.');
  codesTab = Titanium.UI.createTab({
    icon: 'KS_nav_views.png',
    title: 'Scanned Codes',
    window: root.CodesWindow.win
  });
  _ref = [codeReaderTab, accountsTab, codesTab];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    tab = _ref[_i];
    root.tabGroup.addTab(tab);
  }
  root.tabGroup.setActiveTab(accountsTab);
  root.tabGroup.open({
    transition: Titanium.UI.iPhone.AnimationStyle.FLIP_FROM_LEFT
  });
  Ti.include('test.js');
}).call(this);
