Архитектура клиентcкого приложения
==================================

Целью данного проекта является определение лучших практик построения клиентского приложения, в основе которого лежит AngularJS.

Основные компоненты
-------------------

### Взаимодействие с сервером ###

За основу взаимодействия с сервером следует брать принципы REST-архитектуры.

Для упрощения можно использовать только JSON-формат. К сожалению, для JSON-формата не разработано стандартных протоколов запросов и ответов, поэтому определим наш протокол здесь.

#### Методы запросов ####

Должны поддерживаться четыре метода HTTP.

GET - получение сущности или коллекции сущностей.
POST - создание новой сущности.
PUT - обновление сущности или выполнение команды.
DELETE - удаление сущности.

#### Формат запросов ####

GET и DELETE не могут содержать тело запроса. Телом запроса для POST и PUT должно являться JSON-представление сущности или команды.

Пример.
 ```text
    POST /campaigns
    {
      "name": "New campaign",
      "startDate": "2013-10-10"
    }
 ```

При запросе коллекций сервер может поддерживать пагинацию, сортировку и фильтрацию результатов.

Для пагинации используются GET-параметры `_page`, `_perPage`. Параметр `_page` отвечает за то, какую страницу результатов отдавать (начиная с 0), а `_perPage` - сколько элементов должно быть на странице. Например, для запроса первой порции из 20 элементов будет использоваться следующий запрос.

```
GET /campaigns?_page=0&_perPage=20
```

Для сортировки используется пареметр `_sorting`. Он содержит имена параметров, по которым идет сортировка, через пробел. Если сортировка идет по убыванию, параметру должен предшествовать `-`.
Например, для сортировки по имени по возрастанию и по дате старта по убыванию используется запрос.

```
GET /campaigns?_sorting=name+-startDate
```

Наконец, для фильтрации элементов используются параметры, содержащие имена сущностей с опреторами типа "like", "after", "before". Для точного соответствия оператор не используется.
Например, для нахождения активных кампаний, используется такой запрос.

```
GET /campaigns?status=ACTIVE
```

Для нахождения кампаний, которые содержат слово "new" используется запрос

```
GET /campaigns?name_like=new
```

Для нахождения кампаний, дата старта которых после некоторой даты используется запрос

```
GET /campaigns?startDate_after=2013-11-22
```

Для предотвращения кеширования GET-запросов, в параметр `_` также добавляется текущее время.

```
GET /campaigns?_=1385307613654
```

#### Формат ответов ####

Формат ответа на любой зарос должен выглядеть следующим образом.
```text
    {
      "status": %"success", если запрос успешен; "error" иначе%,
      "data": %полезная нагрузка, может отсутствовать в случае ошибки%,
      "message": %сообщение в случае ошибки%,
      "errors": %массив ошибок, например, валидации%,
      "warnings": %массив предупреждений в случае успеха, формат зависит от сущности/команды%,
      "total": %общее число элементов, если в data находится коллекция%
    }
```

Пример запроса конкретной сущности.

```text
    GET /campaigns/12345
    ~
    {
      "status": "success",
      "data": {
        "id": 12345,
        "name": "Some campaign",
        "startDate": "2013-10-10"
      }
    }
```

Пример выполнения команды.

```text
    PUT /campaigns/12345/copy
    {
      "newName": "Copy of 12345 campaign"
    }
    ~
    {
      "status": "success",
      "data": {
        "id": 12346,
        "name": "Copy of 12345 campaign"
        "startDate": "2013-10-10"
      }
      "warnings": [
        "Campaign has no ads"
      ]
    }
```

Пример удаления сущности.

```text
    DELETE /campaigns/123467
    ~
    {
      "status": "error",
      "message": "Campaign not found"
    }
```

Пример запроса коллекции сущностей.

```text
    GET /campaigns?per_page=2
    ~
    {
      "status": "success",
      "data": [
        {
          "id": 12345,
          "name": "Some campaign",
          "startDate": "2013-10-10"
        },
        {
          "id": 12346,
          "name": "Another campaign",
          "startDate": "2013-09-10"
        }
      ],
      "total": 20
    }
```

#### Форматы полей ####

* Строка - любое значение типа String.
* Целое число - целочисленное значение типа Number.
* Число с фиксированной точностью - значение типа String, содержащее цифровые символы.
* Дата - значение типа String в формате ISO 8601 "YYYY-MM-DD".
* Дата и время  - значение типа String в формате ISO 8601 "YYYY-MM-DDThh:mm:ss".
* Флаг - значение типа Boolean.
* Перечисление - значение типа String из заранее заданного набора значений.
* Массив - значение типа Array, элементами которого являются значения допустимых форматов.
* Объект - значение типа Object, значениями полей которого являются значения допустимых форматов.

Допустимым значением поле является null, но не undefined.

Пример.

```
    {
      "string": "Any string value!11",
      "integer": 12345,
      "decimal": "1234.56",
      "date": "2013-10-10",
      "datetime": "2013-10-10T11:22:33",
      "flag": true,
      "enumitem": "GREEN",
      "array": [1, 2, 3],
      "object": {
         "a": 1,
         "b": "hello"
      },
      "nullable": null
    }
```

#### Использование на клиенте ####

На клиенте для запросов используется своя реализация сервиса [$resource](http://docs.angularjs.org/api/ngResource.$resource),
называемая `appResource`. Именно этот сервис отвечает за соответсвие системы протоколу.

Следующие недостатки стандартного `$resource` определяют необходимость своей реализации.

* Отсутствие нативного выбора между POST/PUT.
* Отсутствие хорошего механизма замены сериализаторов/десериализаторов для формирования тела запроса и разбора ответа.
* Возврат методами пустых результирующих объектов вместо promises.
* Отсутствие прослойки для обеспечения валидации.

`appResource` поддерживает те же методы, что и стандартный `$resource`.

* `query` — получение коллекции объектов.
* `get` — получение одного объекта по ключу.
* `save` — сохранение объекта.
* `delete` — удаление объекта.

Методы `save` и `delete` можно вызывать непосредственно у объекта с помощью префикса `$`. Напр., `campaign.$save()`.

Описание ресурсов происходит очень просто.

```javascript
    .factory('Campaign', function (appResource) {
        return appResource('campaigns');
    }
```

Здесь `campaigns` — это относительный путь к ресурсу от корня `api`. Т.е. полный путь будет выглядеть, например, как
`http://localhost/api/campaigns`.

Все методы принимают на вход две функции: функцию обработки успешного результата и функцию обработки ошибки.
Однако, функцию обработки задавать необязательно, в случае ее отсутствия вызовется стандартный хендлер из сервиса `appErrorsHandler`. Подробнее об этом сервисе в разделе о валидации.
Например, код контроллера формы кампании, отвечающий за сохранение будет выглядеть так.

```javascript
    $scope.onSubmit = function () {
        $scope.campaign.$save(  // сохранение...
            function () {  // функция обработки успешного результата
                notificationService.success('Campaign is successfully saved');  // вывод успешного сообщения
                $state.go('campaignsList');  // переход к списку кампаний
            }
        );
    };
```
Примеры на использование query можно посмотреть в разделе про отображение табличных данных.


### Роутинг ###

Стандартный роутинг ангуляра (ныне отдельный пакет angular-router) не очень хорош по причинам:
1. Не поддерживает несколько независимых областей рендеринга.
2. Не позволяет делать вложенные области.
3. Не позволяет именовать маршруты.

В связи с этим предполагается использование [angular-ui-router](https://github.com/angular-ui/ui-router).

Есть два основных способа организации описания роутов: хранить все роуты в одном месте или хранить роуты каждого
модуля отдельно в каждом модуле.

У обоих подходов есть свои плюсы и минусы, но на мой взгляд, подход с хранением урлов в одном месте более целостный.

Пример использования.

```javascript
    $stateProvider
        .state('mainNavigable', {
            abstract: true,
            views: {
                'navbar': {
                    templateUrl: '/scripts/modules/common/templates/navbar.tpl.html',
                    controller: 'NavBarController'
                },
                'main': {
                    template: '<ui-view/>'
                }
            }
        })
        .state('home', {
            parent: 'mainNavigable',
            url: '/',
            templateUrl: '/scripts/modules/common/templates/home.tpl.html',
            controller: 'HomeController'
        })
        .state('campaignsList', {
            parent: 'mainNavigable',
            url: '/campaigns',
            templateUrl: '/scripts/modules/campaigns/templates/list.tpl.html',
            controller: 'CampaignListController'
        })
        .state('campaignsCreate', {
            parent: 'mainNavigable',
            url: '/campaigns/create',
            templateUrl: '/scripts/modules/campaigns/templates/create.tpl.html',
            controller: 'CampaignCreateController'
        });
```

В примере использованы две области рендеринга: `navbar` и `main`. Они заданы в шаблоне как
`<div ui-view="navbar"></div>` и `<div ui-view="main"></div>`.

У всех областей в примере одинаковое меню в области navbar, поэтому используется абстрактное состояние `mainNavigable`,
который задает параметры этой области. Все остальные состояния отображаются в области `main`.

Наследование состояний сознательно задается явно через параметр `parent`, а не через точку в названии. Это придает
дополнительную гибкость: при изменении структуры состояний - ссылки на них не меняются.

Поэтому ссылки на состояния не должны просписываться явно типа `<a href="/campaigns/list/">list</a>`, а должны
использовать имена. Например: `<a ui-sref="campaignsList'>list</a>`. Такой подход позволяет безболезненно менять
урлы без изменения кода и шаблонов.

При необходимости перенаправления из кода контроллера должен использоваться вызов `$state.go()`.

Ссылки:

* [Wiki проекта angular-ui-router](https://github.com/angular-ui/ui-router/wiki)
* [Статья про использование ui-router в больших приложениях](http://lgorithms.blogspot.ru/2013/07/angularui-router-as-infrastructure-of.html)


NB: Мне не очень нравится задание шаблонов в роутинге. На мой взгляд, это должна быть ответственность контроллера.
Но похоже, что это общепринятая практика в angular, которую не стоит менять.


### Шаблонизация ###

В качестве системы шаблонизации выступает сам angular.

Допускаются все практики, описанные в [документации](http://docs.angularjs.org/guide/dev_guide.templates).

Также хорошей практикой является размещение каждого шаблона в отдельном файле.

Подгрузка и склеивание шаблонов будет описана в разделе про сборку.

Вывод чисел, денежных значений, времени и дат будет рассмотрен в разделе про локализацию и интернационализацию.

В целом не надо забывать основных правил хорошей верстки. Использование инлайн-стилей крайне нежелательно.
Верстка и классы должны быть максимально семантичными, а не зависеть от конкретного дизайна или стиля.


### Валидация ###

Валидация должна проходить на двух уровнях: на клиентском и на серверном.

На сервере должно проверяться все то же, что на клиенте, плюс, возможно, дополнительные бизнес-правила.

При таком подходе логично правила хранить на сервере и экспортировать нужные на клиент.

#### Стандартные валидаторы ####

Стандартные валидаторы, которые должны поддерживаться на клиенте и на сервере:

1. Required (NotBlank) - валидатор обязательного присутствия. Параметры:
  * message - сообщения при отсутствии поля
1. Length - валидатор длины строки (текста). Параметры:
  * min - минимально допустимая длина строки
  * max - максимально допустимая длина строки
  * minMessage - сообщение при нарушении минимального ограничения
  * maxMessage - сообщение при нарушении максимального ограничения
  * exactMessage - сообщение при нарушении точного ограничения (если max=min)
1. Range - валидатор диапазона числового значений
  * min - минимально допустимое значение
  * max - макисмально допустимое значение
  * minMessage - сообщение при нарушении минимального ограничения
  * maxMessage - сообщение при нарушении максимального ограничения
  * invalidMessage - сообщение для нечислового значения
1. RegEx - валидатор соответствия строки регулярному выражению
  * pattern - регуярное выражение
  * match - флаг, должна строка соответствовать или не соответствовать выражению
  * message - сообщение при ошибке
1. Email - валидатор соответствия строки валидноиу значению email
  * message - сообщение при ошибке
1. Url - валидатор соответствия строки валидноиу значению url
  * message - сообщение при ошибке

Валидаторы проверки валидного значения даты, времени, флага, enum'a и т.п. на клиенте делать нет смысла, так как за это должны отвечать виджеты.

TODO: поддержка комбинации валидаторов (or, and), поддержка групп

#### Получение правил валидации с сервера ####

Для получения правил валидации необходимо отправлять GET-запрос на сервер.
URL этого шаблона должен выглядеть как URL коллекции ресурса + 'validation'. Напр., `/campaigns/validation`.
Для получения правил валидации определенной группы следует добавлять также ее имя. Напр., `/users/validation/registration`.

В ответ на этот запрос будет возвращен словарь соотвествий поле - массив валидаторов с опциями.

Пример.

```
    GET /campaigns/validation
    ~
    {
      "status": "success",
      "data": {
        "name": [
          {
            "type": "NotBlank",
            "message": "Задайте имя кампании"
          },
          {
            "type": "Length",
            "max": 30,
            "maxMessage": "Имя кампании должно быть короче {{ limit} } символов"
          }
        ],
        "startDate": [
          {
            "type": "NotBlank",
            "message": "Задайте дату начала кампании"
          }
        ]
      }
    }

```

TODO: подумать над вложенными объектами

NB: Можно реализовать адаптер, который будет запоминать правила валидации, чтобы не запрашивать их каждый раз отдельно.
По такому же принципу можно включать правила в дистрибутив клиента, но это еще больше снижает гибкость решения.

#### Реализация валидаторов на angular ####

На клиенте для осуществления валидации необходимо использовать компонент [forms](http://docs.angularjs.org/guide/forms)
из angular.

Использование стандартных директив для задания параметров нам не подходит, поэтому нам необходима своя директива,
которая будет применять правила, полученные с сервера, и выдавать стандратные результаты валидации.

Пример такой директивы.

```javascript
    .directive('appValidator', function ($log, appValidators) {
        return {
            require: 'ngModel',
            restrict: 'A',

            link: function(scope, element, attributes, ngModelCtrl) {
                element.bind('blur', function () {
                    var value = ngModelCtrl.$modelValue;

                    var validators = scope.validation[attributes.appValidator],
                        isValid = true,
                        message = '';

                    _.every(validators, function (vd) {
                        var res = appValidators[vd.type](value, vd);
                        isValid = res.isValid;
                        if (!isValid) {
                            message = res.message;
                        }
                        return isValid;
                    });

                    ngModelCtrl.$setValidity('validator', isValid);

                    element.popover('destroy');
                    if (message) {
                        element.popover({
                            content: message,
                            placement: attributes.appValidatorMessagePosition || 'right',
                            trigger: 'manual'
                        }).popover('show');
                    }
                });
            }
        }
```

Такая директива основана на следующих предположениях.

1. Правила валидации контроллером будут помещаться в `scope` как `scope.validation`.
2. Существует фабрика валидаторов `appValidators`, которая повторяет механизм сервера. См. пример ниже.
3. Сообщения валидации будут появляться в виде всплывающих баблов (`popover`) при потере полем фокуса.

Пример фабрики валидаторов.

```javascript
    .factory('appValidators', function () {
        var formatMessage = function (message, params) {
                params = params || {};
                _.each(params, function (v, k) {
                    message = message.replace('{{ ' + k + ' }}', v);
                });
                return message;
            },
            invalidRes = function (message, params) {
                return {isValid: false, message: formatMessage(message, params)};
            },
            validRes = {isValid: true};

        return {
            NotBlank: function (value, params) {
                if (!(value + "").length) {
                    return invalidRes(params.message);
                }
                return validRes;
            },
            Length: function (value, params) {
                var len = value.length;

                if (params.min === params.max && len != params.min) {
                    return invalidRes(params.exactMessage, {limit: params.min, value: value});
                } else if (params.min && len < params.min) {
                    return invalidRes(params.minMessage, {limit: params.min, value: value});
                } else if (params.max && len > params.max) {
                    return invalidRes(params.maxMessage, {limit: params.max, value: value});
                }
                return validRes;
            }
        }
    })
```

Использование директивы `app-validator` в коде.

```
<input type="text" name="name" ng-model='campaign.name' app-validator='name' />
```

Или более кастомизированный вариант:
```
<input type="text" name="name" ng-model='campaign.name' app-validator='name' app-validator-message-position='right' />
```

Атрибут `app-validtor` задает имя правила валидации. По умолчанию, имя правила равно имени поля.
Атрибут `app-validator-message-position` задает положении бабла (`top` | `bottom` | `left` | `right`). По умолчанию,
справа - `right`.

Отображение ошибок валидации будет происходить за счет специального стиля `ng-invalid`, которые имеют невалидные
контролы, а также с помощью вывода текста ошибок рядом с невалидными значениями.

#### Обработка серверных ошибок валидации ####

При ошибке валидации сервер возвращает ответ с кодом 400.

В поле `errors` при этом должен быть словарь ошибок. Ключами в этом словаре должны быть имена невалидных полей, а
значениями списки текстов ошибок. Если поле валидно, оно будет отсутствовать в словаре.

Пример.

```
{
    "code":400,
    "message": "Ошибка валидации",
    "errors": {
        "name": [
            "Название слишком короткое. Оно должно быть длиннее хотя бы 10 символов.",
            "Название должно начинаться с заглавной буквы."
        ]
        "startDate": [
            "Это поле обязательно."
        ]
    }
}
```

Если поле является составным объектом, то вместо списка ошибко валидации будет такой же словарь, как на верхнем уровне.

Пример.

```
{
    "status": "error",
    "code": 400,
    "message": "Ошибка валидации",
    "errors": {
        "address": {
            "street": [
                "Это поле обязательно."
            ]
        }
    }
}
```

Для обработки серверной валидации можно ввести отдельный сервис `appErrorsHandler` примерно такого вида

```javascript
    .factory('appErrorsHandler', function ($log, appValidationErrors, notificationService) {
        return {
            handle: function (response, $scope) {
                if (response.status === 400) {
                    appValidationErrors.setMessages(response.data.errors);
                    notificationService.error('Please, correct values');
                } else {
                    notificationService.error('Something terrible happened');
                }
            }
        }
    });
```

Как видно, этот обработчик в случае кода 400 передает ошибки в `appValidationErrors` и выдает пользователю предупреждение.
Директива валидации должна быть подписана на `appValidationErrors`, поэтому при обнаружении там своей ошибки, она должна ее отобразить.

```javascript
  appValidationErrors.subscribe(ruleName, function (message) {
      ngModelCtrl.$setValidity('validator', !!message);
      showMessage(element, message, attributes);
  });
```


#### Ссылки ####

* [Валидаторы Symfony](http://symfony.com/doc/current/reference/constraints.html)
* [Стандарт "Bean Validation"](http://download.oracle.com/otn-pub/jcp/bean_validation-1.0-fr-oth-JSpec/bean_validation-1_0-final-spec.pdf?AuthParam=1383573004_27e03ca5ca64652e4accca5669891379)
* [Bootstrap popover](http://getbootstrap.com/2.3.2/javascript.html#popovers)


### Авторизация и персонификация ###

#### Аутентификация и авторизация ####

Авторизация происходит при помощи передачи токена сессии в заголовках запросов.

Для получения токена необходим специальный незащищенный ресурс. Например, `/api/auth`.

На этот ресурс должны отправлять аутентификационные данные: email и пароль пользователя. А также желаемый срок действия токена в часах. Если данные верны, то должны вернуться токен и срок его действия. Если в данных ошибка, возвращаются ошибки валидации в стандартном формате.

```
  POST /api/auth
  {
    "email": "vasya@example.com",
    "password": "$ecret123"
    "ttl": 24
  }
  ~
  {
    "status": "success",
    "code": 200,
    "data": {
      "token": "eeff434fwed23csd",
      "expires": "2013-11-20T10:11:12"
    }
  }
```

Для аутентификации можно создать специальный ресурс.

```
  .factory('Auth', ['appResource',
    function (appResource) {
      return appResource('auth');
    }
  ]);
```

`$save` этого ресурса будет возвращать токен. Полученный токен приложение должно сохранять в cookies с соответствующим сроком действия.

Каждый запрос после аутентификации должен сопровождаться заголовком `X-Api-Token`.

В адаптере запросов это должно выглядеть примерно так.

```
  if ($cookies.token) {
    config.headers = {'X-Api-Token': $cookies.token};
  }
```

Выход из системы должен осуществляться с помощью метода `DELETE`.

```
DELETE /api/auth
```

При успешном запросе приложение должно удалит токен из куков.

#### Ресурс пользователя и персонификация ####

Для получения параметров пользователя также необходимо обращение на специальный ресурс `/api/me`.

```
  GET /api/me
  ~
  {
    "status": "success",
    "code": 200,
    "data": {
      "name": "Vasya Pupkin",
      "email": "vasya@pupkin.ru",
      "language": "en",
      "timezone": "UTC"
    }
  }
```

По аналогии следует создать для этого специальный ресурс.
Запрос на `me` должен делаться в двух случаях.

* При инициализации приложения, если есть токен в куках.
* После входа в систему.

Полученный ответ должен записываться в сервис пользователя и быть доступен всем остальным модулям системы.

TODO: описать сервис пользователя

### Логирование ###

В приложении допустимо использовать следующие уровни логирования.

* error - при возникновении критической ошибки, исправление которой невозможно.
* warning - при возникновении ошибки, которую удалось исправить, либо при другом нежелательном поведении системы.
* info - обычный уровень, следует использовать для логирования, которое может помочь другим разработчикам.
* debug - подробное логирование, используемое при отладке приложения, мало полезное в остальных случаях, кроме отлаживаемого.

Логирование в приложении производится с помощью сервиса `$log` и его соответствующих методов `error()`, `warning()`, `info()`, `debug()`.

В prod-режиме должны логироваться только сообщения уровня error и warning. Это может быть осуществлено за счет конфигурирования logProvider. Включение других логов на prod должно быть возможно с помощью куки `log_level`.

TODO: подумать над использованием sentry с помощью raven-js.


### Unit-тестирование ###

TODO: описать используемые фреймворки, примеры тестов всех "классов", способ запуска

TODO: e2e?


### Основные виджеты ###


#### Строковые значения ####

Используется обычный input типа text, либо textarea.

```html
<input type="text" id="name" name="name" ng-model='campaign.name' app-validator='name' app-validator-message-position='right' placeholder="Name"/>
<textarea name="comment" id="comment" ng-model="campaign.comment"></textarea>
```

#### Целые числа, числа с фиксированной точностью ####

Используется [autoNumeric](http://www.decorplanit.com/plugin/). В пакетах директивы нет, но она очень просто добавляется самостоятельно.

Пример: https://gist.github.com/kwokhou/5964296

```html
<input type="text" id="budget" ng-model="campaign.budget" placeholder="Budget" app-numeric="{vMin: 3, vMax: 10}"/>
```

#### Дата, дата и время ####

Используется [jQuery UI Datepicker](http://jqueryui.com/datepicker) через [angular-ui ui-date](https://github.com/angular-ui/ui-date).

```html
<input type="text" id="start-date" name="start-date" ng-model="campaign.startDate" placeholder="Start date" ui-date="{dateFormat:'dd.mm.yy'}"/>
```

Для выбора времени можно использовать дополнение [jQuery Timepicker Addon](https://github.com/trentrichardson/jQuery-Timepicker-Addon).

#### Флаг (булевское значение) ####

Для флага используется обычный чекбокс.

```html
<input type="checkbox" id="network" ng-model="campaign.network" placeholder="Network">
```

#### Выбор из заданного набора значений ####

Для выбора отлично походит [select2](http://ivaynberg.github.io/select2/). Он может выбирать как одно значения из списка,
так и множество с сохранением порядка.

В ангуляр интегрируется с помощью [angular-ui ui-select2](https://github.com/angular-ui/ui-select2).

```html
<input ng-model="campaign.regions" ui-select2="{data: regions, formatSelection: regionFormat, formatResult: regionFormat}" data-placeholder="Select region">
```

```
$scope.regions = [{id: 0, name: 'Moscow'}, {id: 1, name: 'St. Petersburg'}];
$scope.regionFormat = function format(item) { return item.name; };
```


#### Отображение таблиц, пагинация ####

Формирование таблиц происходит с помощью директивы `ng-repeat`. Сначала описывается заголовок таблицы, а затем формат строк.

Пример таблицы кампаний.

```html
<table class="table table-hover table-bordered">
    <thead>
        <tr>
            <th>#</th>
            <th>Name</th>
            <th>Start Date</th>
            <th>Budget, <app-currency-sign /></th>
            <th>Network</th>
        </tr>
    </thead>
    <tbody>
        <tr ng-repeat="c in campaigns">
            <td>{{c.id}}</td>
            <td><a ui-sref="campaignsEdit({campaignId: c.id})">{{c.name}}</a></td>
            <td>{{c.startDate | amDateFormat:'L' }}</td>
            <td app-numeric="{aSign: ''}" ng-model='c.budget'></td>
            <td>{{c.network | checkmark}}</td>
        </tr>
    </tbody>
</table>
```

В контроллер отдается только часть коллекции - текущая страница.

Для переключения между страницами используется пагинация. Пагинация предоставлена `ui.bootstrap.pagination` 
из пакета (angular-ui-bootstrap)[https://github.com/angular-ui/bootstrap].

Контроллер списка кампаний может выглядеть так.

```javascript
  .controller('CampaignListController', function ($scope, $log, Campaign) {
        $scope.currentPage = 0;
        $scope.itemsPerPage = 2;

        var queryCampaigns = function () {
            return Campaign.query(
                {
                    _page: $scope.currentPage,
                    _perPage: $scope.itemsPerPage
                },
                function (campaigns, total) {
                    $log.debug(campaigns, total);
                    $scope.campaigns = campaigns;
                    $scope.campaignsTotal = total;
                }
            );
        };

        $scope.onPageChange = function (page) {
            $scope.currentPage = page;
            queryCampaigns();
        };

        return queryCampaigns();
    })
```

В шаблоне же под таблицей добавляется строчка пагинатора.

```
<app-pagination total-items="campaignsTotal" page="currentPage+1" items-per-page="itemsPerPage" max-size="5"
                class="pagination-small" boundary-links="true" rotate="false" on-select-page="onPageChange(page-1)"></app-pagination>
```



#### Собственный виджет ####

Иногда для каких-то данных необходим нестандратный виджет (например, для задания временного таргетинга).

Создание виджетов происходит путем создания директив.

Хорошие практики по созданию своих директив описаны здесь: http://www.ng-newsletter.com/posts/directives.html


### Локализация и интернационализация ###

#### Перевод строк ####

Перевод строк будет осуществляться с помощью [gettext](http://ru.wikipedia.org/wiki/Gettext). Это проверенное годами решение,
поддержку которого обеспечивают большое множество утилит.

Для встраивания в angular используется [angular-gettext](http://angular-gettext.rocketeer.be/).

Для выделения строк, которым необходим перевод, используется директива `translate`. Например.

```html
<a href="/" translate>Home</a>
```

Для множественных форм используются атрибуты `translate-plural` и `translate-n`.

```html
<span translate translate-n="count" translate-plural="There are {{count}} messages">There is {{count}} message</a>
```

Для экстрактинга сообщений используется grunt-таски [grunt-angular-gettext](https://npmjs.org/package/grunt-angular-gettext).
Они формирует на основе шаблонов и js-файлов стандартный pot-файл, а после перевода из po файла формируют js-файл, который подключается к приложению.

Для формирования pot-файла используется следующая команда.

```
grunt nggettext_extract
```

Результатом ее выполнения является translations/template.pot

Обновить po-файлики для каждого языка можно либо командой

```
msgmerge -U translations/ru/template.po translations/template.pot
```

либо через GUI. Например, [как здесь](http://angular-gettext.rocketeer.be/dev-guide/translate/).

После обновления po-файлов, их необходимо скомпилировать в js командой

```
grunt nggettext_compile
```

В результате должны обновиться js-файлы в `scripts/translations`.

При необходимости поддерживать разный вид шаблонов для разных языков, шаблоны можно прекомпилировать и раскладывать по языкам.
Описание такого механизма выходит за пределы данного документа.

Установка языка может происходить в любом месте приложения. Например.

```javascript
angular.module('myApp').run(function (gettextCatalog) {
    gettextCatalog.currentLanguage = 'ru';
});
```

Для перевода строк в контроллерах используется функция gettext. Однако, лучше избегать употребления языкозависимых строк в контроллерах.

```javascript
angular.module("myApp").controller("helloController", function (gettext) {
    var myString = gettext("Hello");
});
```

#### Почему не angular-translate ####

[angular-translate](http://pascalprecht.github.io/angular-translate/) основан на [messageformat](https://github.com/SlexAxton/messageformat.js).

messageformat довольно хорошая и мощная штука, поддерживает несколько множественных форм и несколько контекстов в строке.

Но, к сожалению, у нее есть несколько серьезных недостатков.

* Нет экстрактинга сообщений. Необходимо придумывать идентификаторы сообщений, сами сообщения всегда прописывать отдельно от шаблонов.
* Собственный формат, который с которым не работает ни одна утилита перевода.
* У автора очень много планов по добавлению инструментов, но активности по проекту нет уже полгода.

В принципе, при необходимости, можно встроить messageformat поверх gettext.

#### Отображение числовых значений и валюты ####

Для отображения числовых значений используется та же библиотека, что и для ввода числовых значений - `autoNumeric`. Это гарантирует нам
единообразное поведение чисел во всей системе. Для элемента применяется директива `appNumeric` с указанием модели.

```html
<span app-numeric ng-model='bid'></span>
```

Так как `autoNumeric` умеет только рендерится в опеределенный элемент, то допустимо использование директивы только в качестве атрибута.

Для конфигурации локали и валюты используется сервис `appNumericSettings`.

```javascript
appNumericSettings.locale('ru');
appNumericSettings.currency('ruble');
```

Настройки можно перекрыть с помощью опций. Например, можно принудительно отключить знак валюты. Это используется в табличках.

```html
<td app-numeric="{aSign: ''}" ng-model='bid'></td>
```

В таком случае знак валюты выводится отдельно в заголовке с помощью директивы `appCurrencySign`.

```html
<th>Budget, <app-currency-sign/></th>
```

#### Отображение дат ####

Отображение дат происходит с помощью фильтра `amDateFormat` из [angular-moment](https://github.com/urish/angular-moment).

Этот фильтр в большинстве случаев должен использоваться с форматом 'L' (локальная дата) или 'LT' (локальное время).

Примеры.

```html
<span>{{c.startDate | amDateFormat:'L' }}</span>
<div>{{c.updatedAt | amDateFormat:'LT' }}</div>
```

Конфигурация осуществляется через сервис `appMoment`.

```javascript
appMoment.lang('ru');
```


### Автоинспекция кода ###

Инспекция кода производится с помощью jshint.

Файл конфигурации jshint называется .jshintrc и должен быть примерно такого содержания (только без комментариев).

```
{
  "browser": true,  # разрешить использование глобальных переменных браузера, таких как document или FileReader
  "esnext": false,  # не разрешать использование ECMAScript 6
  "bitwise": true,  # не разрешать бинарные операции (как & или |)
  "camelcase": true,  # все переменные должны быть вида camelCase или UPPER_CASE
  "curly": true,  # не разрешать использование блоков без {}
  "eqeqeq": true,  # не разрешать == и != (только === и !==)
  "immed": true,  # inline функции должны браться в скобки, напр., x = (function () { return 1; })()
  "indent": 4,  # отступ должен быть 4 пробела
  "latedef": true,  # запрещает использование переменных до их определения
  "newcap": true,  # конструкторы должны начинаться с большой буквы, напр., new Campaign()
  "noarg": true,  # запрещает использование arguments.caller и arguments.callee
  "quotmark": "true",  # использование одинарных и двойных кавычек должно бысть согласованным
  "undef": true,  # запрещает использование неопределенных переменных
  "unused": true,  # не должно быть неиспользуемых переменных
  "globalstrict": true,  # все файлы должны быть в strict режиме
  "trailing": true,  # запрещает пробелы в конце строк
  "predef": ["angular", "$", "_"]  # разрешает глобальное использование переменных angular, jQuery, underscore
}
```

Подробнее об опциях jshint можно почитать на [офсайте](http://www.jshint.com/docs/options/).

Для того, чтобы jshint не проверял сторонние компоненты, необходим файл .jshintignore, который
будет содержать примерно такой список.

```
./app/bower_components
./node_modules
```

Запуск jshint производится командой
```
jshint ./
```

Желательно эту команду выполнять при сборках на сервере CI. При наличии ошибок, считать сборку неудачной.

Также, например, для Jenkins есть плагин [Violations](https://wiki.jenkins-ci.org/display/JENKINS/Violations),
который позволяет смотреть в интерфейсе ошибки jshint.
Для него необходимо генерировать результат в специальном виде.

```
jshint --jslint-reporter ./ > jslint.xml
```

Кроме того полезным будет ресурс [JSLint Error Explanations](http://jslinterrors.com) для понимания специфичных ошибок.

### Сборка ###

Для сборки релиза используется инструмент [grunt](http://gruntjs.com).

Список плагинов `grunt` можно посмотреть в файле `package.json`. Соответственно, устанавливаются плагины с помощью `npm`.

Отдельно загружать задачи из плагинов нет необходимости, они автоматически загружаются с помощью [load-grunt-tasks](https://npmjs.org/package/load-grunt-tasks).

Сборка приложения осуществляется командой

```
grunt build
```

Под этой командой скрывается цепочка следующих команд.

```
  grunt.registerTask('build', [
    'clean:dist',
    'useminPrepare',
    'ngtemplates',
    'concat',
    'ngmin',
    'cssmin',
    'uglify',
    'rev',
    'copy:dist',
    'usemin'
  ]);
```

* `clean` очищает директорию сборки (по умолчанию, `dist`).
* `useminPrepare` вытаскивает конфигурации, заданные в комментариях `index.html`.
* `ngtemplates` собирает шаблоны из html-файликов в js-файл.
* `concat` склеивает группы файлов в один файл, исходя из конфига.
* `ngmin` меняет объявления функций для корректной работы минимизаторов с DI, см. [здесь](https://github.com/btford/ngmin).
* `cssmin` минимизирует css-файлы.
* `uglify` минимизирует js-файлы.
* `rev` добавляет хэш к именам файлов для предотвращения кеширования.
* `copy:dist` копирует обычные файлы, не задействованные в других задачах (напр, `robots.txt`).
* `usemin` меняет конфигурации в `index.html` на ссылки на сгенерированные файлы.

В итоге в директории `dist` появляется готовое приложение, которое можно раздавать любым http-сервером.


### Замечания ###

#### Установка ####

Для корректной работы в Ubuntu необходимо установить последний nodejs из ppa.

```
sudo add-apt-repository ppa:chris-lea/node.js
```

Кроме nodejs также глобально необходимо установить bower, grunt, jshint.

```
sudo aptitude update
sudo aptitude install nodejs
sudo npm install -g bower grunt-cli jshint
```

После этого поставить зависимости.

```
npm install
bower install
```

И, наконец, запустить приложение.

```
grunt server
```


#### Прочее ####

Описать загрузку файлов?

Общие ошибки валиадции?

Batch-запросы?

Использовать микроюниты?
