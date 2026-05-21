<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Cuisine extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'slug'];

    public static function boot()
    {
        parent::boot();

        static::creating(function ($cuisine) {
            if (empty($cuisine->slug)) {
                $cuisine->slug = Str::slug($cuisine->name);
            }
        });
    }

    public static function findOrCreate(string $name): self
    {
        $normalized = trim(ucwords(strtolower($name)));

        return static::firstOrCreate(
            ['name' => $normalized],
            ['slug' => Str::slug($normalized)]
        );
    }
}
