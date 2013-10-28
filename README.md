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
      "start_date": "2013-10-10"
    }
 ```

TODO: описать get-параметры для запросов коллекций

#### Формат ответов ####

Формат ответа на любой зарос должен выглядеть следующим образом.
```text
    {
      "status": %"success", если запрос успешен; "error" иначе%,
      "data": %полезная нагрузка, может отсутствовать в случае ошибки%,
      "message": %сообщение в случае ошибки%,
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
        "start_date": "2013-10-10"
      }
    }
```

Пример выполнения команды.

```text
    PUT /campaigns/12345/copy
    {
      "new_name": "Copy of 12345 campaign"
    }
    ~
    {
      "status": "success",
      "data": {
        "id": 12346,
        "name": "Copy of 12345 campaign"
        "start_date": "2013-10-10"
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
          "start_date": "2013-10-10"
        },
        {
          "id": 12346,
          "name": "Another campaign",
          "start_date": "2013-09-10"
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
      "string": "Any string value!11"
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

На клиенте для запросов следует использовать сервис $resource модуля ngResource.

Так как наш формат передачи данных немного отличается от принятого, то нам необходимо настроить функции трансформации.

```javascript

    var JSON_START = /^\s*(\[|\{[^\{])/,
        JSON_END = /[\}\]]\s*$/;

    $httpProvider.defaults.transformResponse = function(data, headersGetter) {
        if (JSON_START.test(data) && JSON_END.test(data)) {
            var json = angular.fromJson(data);
            return json.data;
        }
        return data;
    };
```

После этого можно описывать ресурсы.

```javascript
    angular.module('campaigns.resources', ['ngResource'])
        .factory('Campaign', ['$resource',
            function ($resource) {
                 return $resource('api/campaigns/:id', {id: '@id'});
            }
        ]);
```

Использовать этот ресурс можно, например, так:

```javascript
    var campaigns = Campaign.query(function () {
      var campaign = campaigns[0];
      campaign.name = "asdfgh";
      campaign.$save();
    });
```

TODO: по умолчанию $resource не поддерживает PUT. надо подумать, нужно ли его добавлять

TODO: передача токена будет в разделе авторизации


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
использовать имена. Например: `<a ui-sref="campaigns.list'>list</a>`. Такой подход позволяет безболезненно менять
урлы без изменения кода и шаблонов.

При необходимости перенаправления из кода контроллера должен использоваться вызов `$state.go()`.

Ссылки:

* [Wiki проекта angular-ui-router](https://github.com/angular-ui/ui-router/wiki)
* [Статья про использование ui-router  в больших приложениях](http://lgorithms.blogspot.ru/2013/07/angularui-router-as-infrastructure-of.html)


NB: Мне не очень нравится задание шаблонов в роутинге. На мой взгляд, это должна быть ответственность контроллера.
Но похоже, что это общепринятая практика в angular, которую не стоит менять.


### Шаблонизация ###

### Валидация ###

### Авторизация и персонификация ###

### Логирование ###

### Unit-тестирование ###

### Основные виджеты ###

### Сборка ###

### Локализация и интернационализация ###

### Автоинспекция кода ###
