# FatSecret MCP - API Implementation TODO

## Legend
- [ ] Не реализовано
- [x] Реализовано (требует проверки)
- [~] Частично

---

## Test Coverage Improvements (Priority)

### Недостающие тесты для методов
- [x] `getFood` - добавить тест на ошибку API
- [x] `getRecipe` - добавить тест на ошибку API
- [x] `searchFoods` - добавить тест с дефолтными параметрами
- [x] `getFoodEntries` - добавить проверку конвертации даты в запросе
- [x] `createFoodEntry` - добавить проверку конвертации даты

### Edge cases
- [x] Тест: пустой `searchExpression`
- [x] Тест: невалидная дата (`"invalid-date"`)
- [x] Тест: `quantity <= 0`
- [x] Тест: пустой `foodId` / `recipeId`
- [x] Тест: network timeout / connection error
- [x] Тест: malformed JSON response (fallback на querystring)

### Непротестированные функции
- [x] Тест: `client.getConfig()` возвращает копию конфига
- [x] Тест: `client.authorizeUrl` содержит правильный URL
- [x] Тест: `generateNonce()` возвращает уникальные значения
- [x] Тест: `generateTimestamp()` возвращает Unix timestamp
- [x] Тест: fallback на `querystring.parse()` при невалидном JSON

### HTTP статусы
- [x] Тест: 401 Unauthorized - сообщение об ошибке авторизации
- [x] Тест: 403 Forbidden
- [x] Тест: 404 Not Found
- [x] Тест: 500 Internal Server Error

### Качество тестов
- [x] Добавить проверку возвращаемых данных (не только URL/body)
- [~] Добавить тесты для oauth/request.ts напрямую (покрыто через client)
- [~] Добавить тесты для methods/*.ts напрямую (покрыто через client)

---

## Phase 1: Verify Existing Methods (12) - DONE

### Authentication
- [x] Test `set_credentials`
- [x] Test `start_oauth_flow`
- [x] Test `complete_oauth_flow`
- [x] Test `check_auth_status`

### Foods
- [x] Test `foods.search`
- [x] Test `food.get`

### Recipes
- [x] Test `recipes.search`
- [x] Test `recipe.get`

### Profile
- [x] Test `profile.get`

### Food Diary
- [x] Test `food_entries.get`
- [x] Test `food_entry.create`

### Weight
- [x] Test `weights.get_month`

---

## Code Quality Improvements - DONE

### index.ts - Типизация
- [x] Заменить `any` на proper types (14 handlers → typed interfaces)
- [x] Создать интерфейсы для tool inputs (`SetCredentialsInput`, `SearchFoodsInput`, etc.)
- [x] Добавить enum типы (`MealType`, `WeightType`, `HeightType`, `RecipeSortBy`)

### oauth/request.ts - Рефакторинг
- [x] Объединить дублирующуюся логику `makeOAuthRequest` и `makeApiRequest` → `executeRequest()`
- [x] Типизировать `options` в fetch запросах (`FetchOptions`)

### cli.ts - Рефакторинг
- [x] Заменить копии функций на импорты из `oauth/signature.ts` и `utils/encoding.ts`
- [x] Исправить мутацию входного параметра `params.format = "json"`
- [x] Заменить `any` на proper types

### methods/*.ts - Валидация
- [x] Добавить валидацию `searchExpression` (не пустой) в foods.ts, recipes.ts
- [x] Добавить валидацию `quantity` (положительное число) - уже было в diary.ts
- [x] Добавить валидацию `maxResults` (1-50) в foods.ts, recipes.ts
- [x] Добавить валидацию `pageNumber` (>=0) в foods.ts, recipes.ts
- [x] Добавить валидацию процентов (0-100) в recipes.ts
- [x] Добавить валидацию веса/роста (>0) в weight.ts

### Тесты - Покрытие
- [x] Добавить тесты для `getRecipe` - уже было (16 тестов в recipes.test.ts)
- [x] Добавить тесты для `getProfile` - уже было (10 тестов в profile.test.ts)
- [x] Добавить тесты для `encodeParams` - добавлены edge cases
- [x] Добавить тесты для `buildOAuthParams` - уже было (36 тестов)
- [x] Добавить тесты для `createSigningKey` - уже было

### Тесты - Edge Cases
- [x] Тест: пустой `searchExpression` - теперь выбрасывает ошибку
- [x] Тест: невалидная дата - добавлены тесты в date.test.ts
- [x] Тест: отрицательный `quantity` - уже было
- [x] Тест: специальные символы в параметрах - добавлены тесты (unicode, &, =, +, emoji)

### Тесты - Качество
- [x] Исправить timezone-зависимый тест `dateToFatSecretFormat("1970-01-01")` - уже timezone-safe (UTC)
- [x] Удалить неиспользуемый import `afterEach` - не найден, все используются
- [x] Добавить тест проверки правильности OAuth подписи - добавлен блок RFC 5849 валидации

---

## Phase 2: Core Missing Features (5) - DONE

### Food Diary CRUD
- [x] Test `food_entry.edit`
- [x] Implement `food_entry.edit`
- [x] Test `food_entry.delete`
- [x] Implement `food_entry.delete`
- [x] Test `food_entries.get_month`
- [x] Implement `food_entries.get_month`

### Weight
- [x] Test `weight.update`
- [x] Implement `weight.update`

### Foods Search
- [ ] ~~`food.autocomplete`~~ — требует OAuth 2.0 (не реализовано)
- [ ] ~~`food.find_id_for_barcode`~~ — требует OAuth 2.0 (не реализовано)

---

## Phase 3: Exercise Diary (6)

- [ ] Test `exercises.get`
- [ ] Implement `exercises.get`
- [ ] Test `exercise_entries.get`
- [ ] Implement `exercise_entries.get`
- [ ] Test `exercise_entries.get_month`
- [ ] Implement `exercise_entries.get_month`
- [ ] Test `exercise_entries.commit_day`
- [ ] Implement `exercise_entries.commit_day`
- [ ] Test `exercise_entry.edit`
- [ ] Implement `exercise_entry.edit`
- [ ] Test `exercise_entries.save_template`
- [ ] Implement `exercise_entries.save_template`

---

## Phase 4: Saved Meals (8) - DONE

- [x] Test `saved_meal.create`
- [x] Implement `saved_meal.create`
- [x] Test `saved_meal.edit`
- [x] Implement `saved_meal.edit`
- [x] Test `saved_meal.delete`
- [x] Implement `saved_meal.delete`
- [x] ~~`saved_meal.get`~~ — не существует в API (используй `saved_meals.get`)
- [x] Test `saved_meals.get`
- [x] Implement `saved_meals.get`
- [x] Test `saved_meal_item.add`
- [x] Implement `saved_meal_item.add`
- [x] Test `saved_meal_item.edit`
- [x] Implement `saved_meal_item.edit`
- [x] Test `saved_meal_item.delete`
- [x] Implement `saved_meal_item.delete`
- [x] Test `saved_meal_items.get`
- [x] Implement `saved_meal_items.get`

---

## Phase 5: Favorites & History (8) - DONE

### Foods
- [x] Test `food.add_favorite`
- [x] Implement `food.add_favorite`
- [x] Test `food.delete_favorite`
- [x] Implement `food.delete_favorite`
- [x] Test `foods.get_favorites`
- [x] Implement `foods.get_favorites`
- [x] Test `foods.get_most_eaten`
- [x] Implement `foods.get_most_eaten`
- [x] Test `foods.get_recently_eaten`
- [x] Implement `foods.get_recently_eaten`

### Recipes
- [x] Test `recipe.add_favorite`
- [x] Implement `recipe.add_favorite`
- [x] Test `recipe.delete_favorite`
- [x] Implement `recipe.delete_favorite`
- [x] Test `recipes.get_favorites`
- [x] Implement `recipes.get_favorites`

---

## Phase 6: Reference Data & Other (8)

### Reference Data
- [ ] Test `food_brands.get_all`
- [ ] Implement `food_brands.get_all`
- [ ] Test `food_categories.get_all`
- [ ] Implement `food_categories.get_all`
- [ ] Test `food_sub_categories.get_all`
- [ ] Implement `food_sub_categories.get_all`
- [ ] Test `recipe_types.get`
- [ ] Implement `recipe_types.get`

### Custom Foods
- [ ] Test `food.create`
- [ ] Implement `food.create`

### Auth Extended
- [ ] Test `profile.create`
- [ ] Implement `profile.create`
- [ ] Test `profile.get_auth`
- [ ] Implement `profile.get_auth`

### Food Diary Extended
- [ ] Test `food_entries.copy`
- [ ] Implement `food_entries.copy`

---

## Summary

| Phase | Tests | Implementations | Total Tasks |
|-------|-------|-----------------|-------------|
| 1 | 12 | 0 (verify) | 12 |
| 2 | 5 | 5 | 10 |
| 3 | 6 | 6 | 12 |
| 4 | 9 | 9 | 18 |
| 5 | 8 | 8 | 16 |
| 6 | 8 | 8 | 16 |
| **Total** | **48** | **36** | **84** |
