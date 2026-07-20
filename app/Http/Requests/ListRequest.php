<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ListRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rules = [
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:1000',
            'search' => 'nullable|string|max:255',
            'direction' => 'nullable|string|in:asc,desc,ASC,DESC',
        ];

        $controller = $this->route() ? $this->route()->controller : null;
        $action = $this->route() ? $this->route()->getActionMethod() : '';

        $allowed = ['id', 'created_at'];
        if ($controller) {
            if ($action === 'submissions') {
                $allowed = ['id', 'student_id', 'status', 'submitted_at', 'created_at'];
            } elseif (isset($controller->sortableColumns) && is_array($controller->sortableColumns)) {
                $allowed = $controller->sortableColumns;
            }
        }

        $rules['sort'] = 'nullable|string|in:' . implode(',', $allowed);

        return $rules;
    }
}
